import cac from "cac";
import { version } from "../package.json";
import { init } from "./commands/init";

const cli = cac("ai-devkit-buddy");

cli
  .command("init", "Initialize ai-devkit-buddy in the current project")
  .option("-e, --environment <env>", "Specify environment (cursor|claude|both)")
  .option("-a, --all", "Initialize all phases at once")
  .option("-p, --phases <phases>", "Comma-separated list of specific phases")
  .action(async (options) => {
    await init(options);
  });

cli.help();
cli.version(version);

export { cli };
