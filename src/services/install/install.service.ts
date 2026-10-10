import path from "path";
import { CLI_NAME } from "../../constants";
import {
  addEnvironments,
  emptyProjectConfig,
  projectConfigPath,
  readProjectConfig,
  readProjectConfigFile,
  upsertSkill,
  writeProjectConfig,
} from "../../lib/config";
import type { SkillInstallMode, SkillInstallResult } from "../../types";
import { ConfigNotFoundError, ValidationError, errorMessage } from "../../util/errors";
import { addSkills } from "../skill/installer/installer.service";

export interface InstallFailure {
  registry: string;
  names: string[];
  error: string;
}

export interface InstallReport {
  results: SkillInstallResult[];
  failures: InstallFailure[];
}

/** Reconciles the project with a config file: environments, registries, then every listed skill. */
export async function installFromConfig({
  projectDir,
  configPath,
  overwrite = false,
}: {
  projectDir: string;
  configPath?: string;
  overwrite?: boolean;
}): Promise<InstallReport> {
  const projectFile = projectConfigPath(projectDir);
  const file = configPath ? path.resolve(projectDir, configPath) : projectFile;
  const desired = await readProjectConfigFile(file);
  if (!desired) throw new ConfigNotFoundError(`Config not found: ${file}. Run: ${CLI_NAME} init`);
  if (!desired.environments.length) {
    throw new ValidationError(`${file} lists no environments. Run: ${CLI_NAME} init -e <env>`);
  }

  if (file !== projectFile) {
    let config = addEnvironments((await readProjectConfig(projectDir)) ?? emptyProjectConfig(), desired.environments);
    config = { ...config, registries: { ...config.registries, ...desired.registries } };
    for (const skill of desired.skills) config = upsertSkill(config, skill);
    await writeProjectConfig(projectDir, config);
  }

  const groups = new Map<string, { registry: string; mode?: SkillInstallMode; names: string[] }>();
  for (const skill of desired.skills) {
    const key = `${skill.registry}\0${skill.mode ?? ""}`;
    const group = groups.get(key) ?? { registry: skill.registry, mode: skill.mode, names: [] };
    group.names.push(skill.name);
    groups.set(key, group);
  }

  const report: InstallReport = { results: [], failures: [] };
  for (const { registry, mode, names } of groups.values()) {
    try {
      report.results.push(
        ...(await addSkills(registry, names, { projectDir, environments: desired.environments, mode, overwrite }))
      );
    } catch (error) {
      report.failures.push({ registry, names, error: errorMessage(error) });
    }
  }
  return report;
}
