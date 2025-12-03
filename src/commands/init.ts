import { select, checkbox } from "@inquirer/prompts";
import pc from "picocolors";
import fs from "fs-extra";
import path from "path";
import { updateTrackerConfig } from "../utils/tracker";

interface InitOptions {
  environment?: string;
  all?: boolean;
  types?: string;
}

const AVAILABLE_TYPES = [
  "onboarding",
  "capture-knowledge",
  "ado-refine-new-us",
];

export async function init(options: InitOptions) {
  console.log(pc.green("\n🤖 AI-DevKit Buddy Initialization\n"));

  let environment = options.environment;
  if (!environment) {
    environment = await select({
      message: "Select an AI agent to configure:",
      choices: [
        { name: "Cursor", value: "cursor" },
        { name: "Claude Code", value: "claude" },
        { name: "Both", value: "both" },
      ],
    });
  }

  let selectedTypes: string[] = [];
  if (options.all) {
    selectedTypes = AVAILABLE_TYPES;
  } else if (options.types) {
    selectedTypes = options.types.split(",").map((p) => p.trim());
  } else {
    selectedTypes = await checkbox({
      message:
        "Select types to initialize (Press <space> to select, <a> to toggle all, <enter> to confirm):",
      choices: AVAILABLE_TYPES.map((p) => ({ name: p, value: p })),
    });

    if (selectedTypes.length === 0) {
      console.log(
        pc.yellow(
          "⚠️  No types selected. You must use <space> to select types."
        )
      );
      return;
    }
  }

  console.log(pc.cyan(`\nEnvironment: ${environment}`));
  console.log(pc.cyan(`Types: ${selectedTypes.join(", ")}\n`));

  const cwd = process.cwd();
  const templateBaseDir = path.join(__dirname, "../../src/templates/commands");

  for (const type of selectedTypes) {
    const templateFile = `${type}.md`;
    const sourcePath = path.join(templateBaseDir, templateFile);

    if (!fs.existsSync(sourcePath)) {
      console.warn(pc.yellow(`Template not found for type: ${type}`));
      continue;
    }

    const targets: { env: string; path: string }[] = [];

    if (environment === "cursor" || environment === "both") {
      targets.push({
        env: "cursor",
        path: path.join(cwd, ".cursor/commands", templateFile),
      });
    }
    if (environment === "claude" || environment === "both") {
      targets.push({
        env: "claude",
        path: path.join(cwd, ".claude/commands", templateFile),
      });
    }

    for (const target of targets) {
      try {
        await fs.ensureDir(path.dirname(target.path));
        await fs.copy(sourcePath, target.path);
        console.log(
          pc.green(`✅ Generated ${type} template for ${target.env}`)
        );
      } catch (error) {
        console.error(
          pc.red(`Failed to generate ${type} for ${target.env}:`),
          error
        );
      }
    }
  }

  await updateTrackerConfig({
    environment: environment as "cursor" | "claude" | "both",
    initializedTypes: selectedTypes,
  });
}
