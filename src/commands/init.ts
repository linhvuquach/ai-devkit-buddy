import { select, checkbox } from "@inquirer/prompts";
import pc from "picocolors";
import fs from "fs-extra";
import path from "path";
import { updateTrackerConfig } from "../utils/tracker";

interface InitOptions {
  environment?: string;
  all?: boolean;
  phases?: string;
}

const AVAILABLE_PHASES = [
  "requirements",
  "design",
  "planning",
  "coding",
  "review",
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

  let selectedPhases: string[] = [];
  if (options.all) {
    selectedPhases = AVAILABLE_PHASES;
  } else if (options.phases) {
    selectedPhases = options.phases.split(",").map((p) => p.trim());
  } else {
    selectedPhases = await checkbox({
      message:
        "Select phases to initialize (Press <space> to select, <a> to toggle all, <enter> to confirm):",
      choices: AVAILABLE_PHASES.map((p) => ({ name: p, value: p })),
    });

    if (selectedPhases.length === 0) {
      console.log(
        pc.yellow(
          "⚠️  No phases selected. You must use <space> to select phases."
        )
      );
      return;
    }
  }

  console.log(pc.cyan(`\nEnvironment: ${environment}`));
  console.log(pc.cyan(`Phases: ${selectedPhases.join(", ")}\n`));

  const cwd = process.cwd();
  const templateBaseDir = path.join(__dirname, "../../src/templates");

  for (const phase of selectedPhases) {
    const templateFile = `${phase}.md`;
    const sourcePath = path.join(templateBaseDir, templateFile);

    if (!fs.existsSync(sourcePath)) {
      console.warn(pc.yellow(`Template not found for phase: ${phase}`));
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
          pc.green(`✅ Generated ${phase} template for ${target.env}`)
        );
      } catch (error) {
        console.error(
          pc.red(`Failed to generate ${phase} for ${target.env}:`),
          error
        );
      }
    }
  }

  await updateTrackerConfig({
    environment: environment as "cursor" | "claude" | "both",
    initializedPhases: selectedPhases,
  });
}
