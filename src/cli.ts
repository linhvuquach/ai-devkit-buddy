import cac from "cac";
import { version } from "../package.json";
import { init } from "./commands/init";

const cli = cac("ai-devkit-buddy");

cli
  .command("init", "Initialize ai-devkit-buddy in the current project")
  .option(
    "-e, --environment <env>",
    "Set AI environment (cursor, claude, both)"
  )
  .option("-a, --all", "Initialize all available types")
  .option("-t, --types <types>", "Comma-separated list of types to initialize")
  .action((options) => {
    init(options);
  });

cli.help();
cli.version(version);

export { cli };
