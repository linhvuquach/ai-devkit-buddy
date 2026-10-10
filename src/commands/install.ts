import { installFromConfig } from "../services/install/install.service";
import { renderInstallReport } from "./skill/skill.render";

export async function install(
  options: { config?: string; overwrite?: boolean },
  projectDir: string
): Promise<void> {
  const report = await installFromConfig({ projectDir, configPath: options.config, overwrite: options.overwrite });
  renderInstallReport(report);
  if (report.failures.length || report.results.some((result) => result.action === "conflict")) {
    process.exitCode = 1;
  }
}
