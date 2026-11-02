import { checkbox } from "@inquirer/prompts";
import fs from "fs-extra";
import path from "path";
import { BUILTIN_SKILL_REGISTRY, CLI_NAME, COMMAND_TEMPLATES_DIR } from "../constants";
import { addEnvironments, emptyProjectConfig, readProjectConfig, writeProjectConfig } from "../lib/config";
import { addSkills } from "../services/skill/installer/installer.service";
import { getBuiltinSkills } from "../services/skill/skill-builtins";
import type { EnvironmentCode } from "../types";
import { getAllEnvironments, getEnvironment, parseEnvironmentCodes } from "../util/env";
import { CliError } from "../util/errors";
import { isInteractive, ui } from "../util/terminal-ui";
import { renderCommandCopies, renderInstallResults } from "./skill/skill.render";

export interface InitOptions {
  environment?: string;
  builtIn?: boolean;
  yes?: boolean;
  overwrite?: boolean;
}

interface Selection {
  skills: string[];
  commands: string[];
}

async function listCommandTemplates(): Promise<string[]> {
  const entries = await fs.readdir(COMMAND_TEMPLATES_DIR).catch(() => []);
  return entries.filter((file) => file.endsWith(".md")).map((file) => file.slice(0, -3)).sort();
}

function rerunCommand(options: InitOptions): string {
  return `${CLI_NAME} init -e claude,cursor,codex --yes${options.builtIn ? " --built-in" : ""}`;
}

async function chooseEnvironments(options: InitOptions, current: EnvironmentCode[]): Promise<EnvironmentCode[]> {
  if (options.environment) return parseEnvironmentCodes(options.environment);
  if (options.yes) throw new CliError(`--yes needs --environment. Run: ${rerunCommand(options)}`);
  if (!isInteractive()) throw new CliError(`No TTY to prompt for environments. Run: ${rerunCommand(options)}`);
  const codes = await checkbox<EnvironmentCode>({
    message: "Select AI agents to configure:",
    choices: getAllEnvironments().map((env) => ({ name: env.name, value: env.code, checked: current.includes(env.code) })),
    required: true,
  });
  return codes;
}

async function chooseContent(options: InitOptions, environments: EnvironmentCode[]): Promise<Selection> {
  const skills = (await getBuiltinSkills()).map((skill) => skill.name);
  const commands = await listCommandTemplates();
  if (options.builtIn) return { skills, commands };
  if (options.yes) return { skills: [], commands: [] };
  if (!isInteractive()) {
    const envs = environments.join(",");
    throw new CliError(
      `No TTY to pick skills. Run: ${CLI_NAME} init -e ${envs} --built-in (everything) or ${CLI_NAME} init -e ${envs} --yes (config only)`
    );
  }
  const picked = await checkbox({
    message: "Select built-in skills and commands (<space> to select, <a> to toggle all):",
    choices: [
      ...skills.map((name) => ({ name: `${name} (skill)`, value: `skill:${name}` })),
      ...commands.map((name) => ({ name: `${name} (command)`, value: `command:${name}` })),
    ],
  });
  const of = (kind: string) => picked.filter((v) => v.startsWith(`${kind}:`)).map((v) => v.slice(kind.length + 1));
  return { skills: of("skill"), commands: of("command") };
}

async function copyCommandTemplates(
  projectDir: string,
  environments: EnvironmentCode[],
  names: string[],
  overwrite: boolean
): Promise<{ name: string; target: string; copied: boolean }[]> {
  const copies = [];
  for (const code of environments) {
    const commandPath = getEnvironment(code).commandPath;
    if (!commandPath) continue;
    for (const name of names) {
      const target = path.join(projectDir, commandPath, `${name}.md`);
      const copied = overwrite || !(await fs.pathExists(target));
      if (copied) await fs.copy(path.join(COMMAND_TEMPLATES_DIR, `${name}.md`), target);
      copies.push({ name, target, copied });
    }
  }
  return copies;
}

export async function init(options: InitOptions, projectDir: string): Promise<void> {
  const existing = (await readProjectConfig(projectDir)) ?? emptyProjectConfig();
  const environments = await chooseEnvironments(options, existing.environments);
  const selection = await chooseContent(options, environments);

  await writeProjectConfig(projectDir, addEnvironments(existing, environments));
  ui.success(`Configured environments: ${environments.join(", ")}`);

  if (selection.skills.length) {
    const results = await addSkills(BUILTIN_SKILL_REGISTRY, selection.skills, {
      projectDir,
      environments,
      overwrite: options.overwrite,
    });
    renderInstallResults(results);
  }
  if (selection.commands.length) {
    renderCommandCopies(
      await copyCommandTemplates(projectDir, environments, selection.commands, options.overwrite ?? false)
    );
  }
}
