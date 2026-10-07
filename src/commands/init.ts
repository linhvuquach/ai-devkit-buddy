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

type TemplateKind = "command" | "skill";

interface Template {
  name: string;
  kind: TemplateKind;
  source: string;
}

const TEMPLATE_DIRS: Record<TemplateKind, string> = {
  command: "commands",
  skill: "skills",
};

async function listTemplates(baseDir: string): Promise<Template[]> {
  const templates: Template[] = [];

  const commandsDir = path.join(baseDir, TEMPLATE_DIRS.command);
  if (fs.existsSync(commandsDir)) {
    for (const entry of await fs.readdir(commandsDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        templates.push({
          name: entry.name.slice(0, -3),
          kind: "command",
          source: path.join(commandsDir, entry.name),
        });
      }
    }
  }

  const skillsDir = path.join(baseDir, TEMPLATE_DIRS.skill);
  if (fs.existsSync(skillsDir)) {
    for (const entry of await fs.readdir(skillsDir, { withFileTypes: true })) {
      const source = path.join(skillsDir, entry.name);
      if (entry.isDirectory() && fs.existsSync(path.join(source, "SKILL.md"))) {
        templates.push({ name: entry.name, kind: "skill", source });
      }
    }
  }

  return templates;
}

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

  const templateBaseDir = path.join(__dirname, "../../src/templates");
  const templates = await listTemplates(templateBaseDir);

  let selectedTypes: string[] = [];
  if (options.all) {
    selectedTypes = templates.map((t) => t.name);
  } else if (options.types) {
    selectedTypes = options.types.split(",").map((p) => p.trim());
  } else {
    selectedTypes = await checkbox({
      message:
        "Select commands and skills to initialize (Press <space> to select, <a> to toggle all, <enter> to confirm):",
      choices: templates.map((t) => ({
        name: `${t.name} (${t.kind})`,
        value: t.name,
      })),
    });

    if (selectedTypes.length === 0) {
      console.log(
        pc.yellow(
          "⚠️  Nothing selected. You must use <space> to select items."
        )
      );
      return;
    }
  }

  console.log(pc.cyan(`\nEnvironment: ${environment}`));
  console.log(pc.cyan(`Types: ${selectedTypes.join(", ")}\n`));

  const cwd = process.cwd();
  const envDirs: string[] = [];
  if (environment === "cursor" || environment === "both") envDirs.push("cursor");
  if (environment === "claude" || environment === "both") envDirs.push("claude");

  for (const type of selectedTypes) {
    const matches = templates.filter((t) => t.name === type);

    if (matches.length === 0) {
      console.warn(pc.yellow(`Template not found for type: ${type}`));
      continue;
    }

    for (const template of matches) {
      for (const env of envDirs) {
        const targetPath =
          template.kind === "command"
            ? path.join(cwd, `.${env}/commands`, `${template.name}.md`)
            : path.join(cwd, `.${env}/skills`, template.name);

        try {
          await fs.ensureDir(path.dirname(targetPath));
          await fs.copy(template.source, targetPath);
          console.log(
            pc.green(`✅ Generated ${template.name} ${template.kind} for ${env}`)
          );
        } catch (error) {
          console.error(
            pc.red(`Failed to generate ${template.name} for ${env}:`),
            error
          );
        }
      }
    }
  }

  await updateTrackerConfig({
    environment: environment as "cursor" | "claude" | "both",
    initializedTypes: selectedTypes,
  });
}
