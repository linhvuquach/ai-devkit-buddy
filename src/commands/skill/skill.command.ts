import { checkbox } from "@inquirer/prompts";
import { Command, InvalidArgumentError, Option } from "commander";
import path from "path";
import { BUILTIN_SKILL_REGISTRY, CLI_NAME } from "../../constants";
import { findSkills, rebuildIndex } from "../../services/skill/index/index.service";
import {
  addSkills,
  listGlobalSkills,
  listInstallableSkills,
  listSkills,
  removeSkill,
} from "../../services/skill/installer/installer.service";
import { getBuiltinSkills } from "../../services/skill/skill-builtins";
import { addRegistry, removeRegistry, updateRegistries } from "../../services/skill/skill.service";
import type { EnvironmentCode, SkillInstallMode } from "../../types";
import { parseEnvironmentCodes } from "../../util/env";
import { CliError, withErrorHandler } from "../../util/errors";
import { isInteractive, ui } from "../../util/terminal-ui";
import {
  renderGlobalSkills,
  renderInstallResults,
  renderProjectSkills,
  renderRegistryStatus,
  renderSearchResults,
  renderUpdateSummary,
} from "./skill.render";

const DEFAULT_FIND_LIMIT = 10;

interface ScopeFlags {
  global?: boolean;
  env?: string[];
}

function envCodes(flags: ScopeFlags): EnvironmentCode[] | undefined {
  return flags.env ? parseEnvironmentCodes(flags.env) : undefined;
}

function positiveInt(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new InvalidArgumentError("Expected a positive integer.");
  return parsed;
}

const envOption = () => new Option("-e, --env <env...>", "target environments (claude, cursor, codex)");

async function pickSkillNames(projectDir: string, registry: string): Promise<string[]> {
  if (!isInteractive()) {
    throw new CliError(
      `No skill name given and no TTY to prompt. Run: ${CLI_NAME} skill add ${registry} <skill-name>`
    );
  }
  const available = await listInstallableSkills(projectDir, registry);
  if (!available.length) throw new CliError(`Registry ${registry} has no installable skills.`);
  return checkbox({
    message: `Select skills from ${registry}:`,
    choices: available.map((skill) => ({ name: `${skill.name} - ${skill.description}`, value: skill.name })),
  });
}

export function registerSkillCommands(program: Command, projectDir: string): void {
  const skill = program.command("skill").description("Install, search and manage agent skills");

  skill
    .command("add [registry] [names...]")
    .description("Install skills from a registry (interactive picker when no name is given)")
    .option("--built-in", "install every built-in skill")
    .option("-g, --global", "install into the home directory instead of the project")
    .addOption(envOption())
    .addOption(new Option("--mode <mode>", "install mode").choices(["link", "copy"]))
    .option("--overwrite", "replace an existing symlink when installing with --mode copy")
    .action(
      withErrorHandler(
        async (
          registryArg: string | undefined,
          nameArgs: string[],
          flags: ScopeFlags & { builtIn?: boolean; mode?: SkillInstallMode; overwrite?: boolean }
        ) => {
          const registry = flags.builtIn ? BUILTIN_SKILL_REGISTRY : registryArg;
          if (!registry) {
            throw new CliError(`Specify a registry. Run: ${CLI_NAME} skill add <registry> <skill-name> (or --built-in)`);
          }
          const names = flags.builtIn
            ? (await getBuiltinSkills()).map((builtin) => builtin.name)
            : nameArgs.length
              ? nameArgs
              : await pickSkillNames(projectDir, registry);
          if (!names.length) {
            ui.warn("Nothing selected.");
            return;
          }
          const results = await addSkills(registry, names, {
            projectDir,
            global: flags.global,
            environments: envCodes(flags),
            mode: flags.mode,
            overwrite: flags.overwrite,
          });
          renderInstallResults(results);
          if (results.some((result) => result.action === "conflict")) process.exitCode = 1;
        }
      )
    );

  skill
    .command("list")
    .description("List installed project skills, or global skills with -g")
    .option("-g, --global", "list skills installed in the home directory")
    .addOption(envOption())
    .action(
      withErrorHandler(async (flags: ScopeFlags) => {
        if (flags.env && !flags.global) throw new CliError("--env filters global skills only; add --global.");
        if (flags.global) renderGlobalSkills(await listGlobalSkills(envCodes(flags)));
        else renderProjectSkills(await listSkills(projectDir));
      })
    );

  skill
    .command("remove <name>")
    .description("Uninstall a skill")
    .option("-g, --global", "remove from the home directory")
    .addOption(envOption())
    .action(
      withErrorHandler(async (name: string, flags: ScopeFlags) => {
        const removed = await removeSkill(name, { projectDir, global: flags.global, environments: envCodes(flags) });
        if (!removed.length) ui.info(`Skill ${name} was not installed.`);
        for (const target of removed) ui.success(`removed ${target}`);
      })
    );

  skill
    .command("find <keyword>")
    .description("Search skills across all registries")
    .option("--refresh", "rebuild the index from every registry first")
    .option("--limit <n>", "maximum results", positiveInt, DEFAULT_FIND_LIMIT)
    .option("--all", "show every match")
    .action(
      withErrorHandler(async (keyword: string, flags: { refresh?: boolean; limit: number; all?: boolean }) => {
        const results = await findSkills(projectDir, keyword, {
          refresh: flags.refresh,
          limit: flags.all ? undefined : flags.limit,
        });
        renderSearchResults(results, keyword);
      })
    );

  skill
    .command("update [registry-id]")
    .description("Pull cached git registries and refresh the index")
    .action(
      withErrorHandler(async (registryId: string | undefined) => {
        const summary = await updateRegistries(projectDir, registryId);
        renderUpdateSummary(summary);
        if (summary.some((item) => item.status === "failed")) process.exitCode = 1;
      })
    );

  skill
    .command("add-registry <id> <source>")
    .description("Register a git URL or local folder (file://, absolute or ./relative path)")
    .option("-g, --global", "write to the global config")
    .option("-f, --force", "replace a conflicting source")
    .action(
      withErrorHandler(async (id: string, source: string, flags: { global?: boolean; force?: boolean }) => {
        const { status, indexed } = await addRegistry(id, source, { projectDir, ...flags });
        renderRegistryStatus(id, status);
        if (indexed?.status === "failed") ui.warn(`Registered, but indexing failed: ${indexed.error}`);
      })
    );

  skill
    .command("remove-registry <id>")
    .description("Unregister a registry (-g also deletes its cached clone)")
    .option("-g, --global", "remove from the global config")
    .action(
      withErrorHandler(async (id: string, flags: { global?: boolean }) => {
        renderRegistryStatus(id, await removeRegistry(id, { projectDir, global: flags.global }));
      })
    );

  skill
    .command("rebuild-index")
    .description("Rebuild the search index from every registry")
    .option("--output <path>", "write the index to this file")
    .action(
      withErrorHandler(async (flags: { output?: string }) => {
        const index = await rebuildIndex(projectDir, flags.output ? path.resolve(projectDir, flags.output) : undefined);
        ui.success(`Indexed ${index.skills.length} skills.`);
      })
    );
}
