import { Command } from "commander";
import { CLI_NAME, CONFIG_FILE, PACKAGE_VERSION } from "./constants";
import { init } from "./commands/init";
import { install } from "./commands/install";
import { registerSkillCommands } from "./commands/skill/skill.command";
import { withErrorHandler } from "./util/errors";

export function createProgram(projectDir: string = process.cwd()): Command {
  const program = new Command(CLI_NAME)
    .description("Install and manage agent skills for Claude Code, Cursor and Codex")
    .version(PACKAGE_VERSION, "-v, --version")
    .showHelpAfterError();

  program
    .command("init")
    .description(`Pick environments, write ${CONFIG_FILE} and install built-in skills`)
    .option("-e, --environment <envs>", "comma-separated environments: claude, cursor, codex (legacy: both)")
    .option("--built-in", "install every built-in skill and command template without prompting")
    .option("-a, --all", "alias for --built-in")
    .option("-y, --yes", "never prompt (requires --environment)")
    .option("--overwrite", "replace existing command templates")
    .action(
      withErrorHandler(async (flags: { environment?: string; builtIn?: boolean; all?: boolean; yes?: boolean; overwrite?: boolean }) => {
        await init({ ...flags, builtIn: flags.builtIn || flags.all }, projectDir);
      })
    );

  program
    .command("install")
    .description(`Reconcile the project with ${CONFIG_FILE}`)
    .option("-c, --config <path>", "config file to install from", CONFIG_FILE)
    .option("--overwrite", "replace existing symlinks for copy-mode skills")
    .action(withErrorHandler((flags: { config: string; overwrite?: boolean }) => install(flags, projectDir)));

  registerSkillCommands(program, projectDir);
  return program;
}
