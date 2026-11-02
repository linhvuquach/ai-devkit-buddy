import fs from "fs-extra";
import path from "path";
import { CONFIG_FILE } from "../constants";
import type { EnvironmentCode, ProjectConfig, RegistryMap, SkillRef } from "../types";
import { CliError, ValidationError } from "../util/errors";
import { parseEnvironmentCodes } from "../util/env";

export function projectConfigPath(projectDir: string): string {
  return path.join(projectDir, CONFIG_FILE);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRegistryMap(raw: unknown, where: string): RegistryMap {
  if (raw === undefined) return {};
  if (!isRecord(raw) || Object.values(raw).some((source) => typeof source !== "string")) {
    throw new ValidationError(`${where}: "registries" must map registry ids to source strings.`);
  }
  return raw as RegistryMap;
}

/** Accepts the current shape and the legacy tracker shape (`environment: "cursor"|"claude"|"both"`). */
export function parseProjectConfig(raw: unknown, where: string = CONFIG_FILE): ProjectConfig {
  if (!isRecord(raw)) throw new ValidationError(`${where}: expected a JSON object.`);
  const envInput = raw.environments ?? raw.environment ?? [];
  if (typeof envInput !== "string" && !(Array.isArray(envInput) && envInput.every((e) => typeof e === "string"))) {
    throw new ValidationError(`${where}: "environments" must be a list of environment codes.`);
  }
  const environments = parseEnvironmentCodes(envInput);

  const rawSkills = raw.skills ?? [];
  if (!Array.isArray(rawSkills)) throw new ValidationError(`${where}: "skills" must be a list.`);
  const skills = rawSkills.map((skill): SkillRef => {
    if (!isRecord(skill) || typeof skill.registry !== "string" || typeof skill.name !== "string") {
      throw new ValidationError(`${where}: each skill needs string "registry" and "name".`);
    }
    if (skill.mode !== undefined && skill.mode !== "link" && skill.mode !== "copy") {
      throw new ValidationError(`${where}: skill mode must be "link" or "copy".`);
    }
    return { registry: skill.registry, name: skill.name, ...(skill.mode ? { mode: skill.mode } : {}) };
  });

  const config: ProjectConfig = { environments, skills };
  if (raw.registries !== undefined) config.registries = parseRegistryMap(raw.registries, where);
  return config;
}

export async function readProjectConfigFile(file: string): Promise<ProjectConfig | null> {
  if (!(await fs.pathExists(file))) return null;
  let raw: unknown;
  try {
    raw = await fs.readJson(file);
  } catch (error) {
    throw new ValidationError(`${file} is not valid JSON: ${(error as Error).message}`);
  }
  return parseProjectConfig(raw, file);
}

export function readProjectConfig(projectDir: string): Promise<ProjectConfig | null> {
  return readProjectConfigFile(projectConfigPath(projectDir));
}

export async function writeProjectConfig(projectDir: string, config: ProjectConfig): Promise<void> {
  await fs.ensureDir(projectDir);
  await fs.writeJson(projectConfigPath(projectDir), config, { spaces: 2 });
}

export function emptyProjectConfig(): ProjectConfig {
  return { environments: [], skills: [] };
}

export function addEnvironments(config: ProjectConfig, codes: readonly EnvironmentCode[]): ProjectConfig {
  return { ...config, environments: [...new Set([...config.environments, ...codes])] };
}

/** Idempotent upsert keyed by registry + name; `mode` changes only when given explicitly. */
export function upsertSkill(config: ProjectConfig, ref: SkillRef): ProjectConfig {
  const index = config.skills.findIndex((s) => s.registry === ref.registry && s.name === ref.name);
  if (index === -1) return { ...config, skills: [...config.skills, ref] };
  const skills = [...config.skills];
  skills[index] = ref.mode ? { ...skills[index], mode: ref.mode } : skills[index];
  return { ...config, skills };
}

export function removeSkillRef(config: ProjectConfig, name: string): ProjectConfig {
  return { ...config, skills: config.skills.filter((s) => s.name !== name) };
}

export type RegistryAddStatus = "added" | "updated" | "already-registered";
export type RegistryRemoveStatus = "removed" | "not-registered";

export function planSkillRegistryAdd(
  registries: RegistryMap,
  id: string,
  source: string,
  force: boolean
): { status: RegistryAddStatus; registries: RegistryMap } {
  const existing = registries[id];
  if (existing === source) return { status: "already-registered", registries };
  if (existing !== undefined && !force) {
    throw new CliError(
      `Registry "${id}" is already registered with source "${existing}". Re-run with --force to replace it.`,
      "REGISTRY_CONFLICT"
    );
  }
  return { status: existing === undefined ? "added" : "updated", registries: { ...registries, [id]: source } };
}

export function planSkillRegistryRemove(
  registries: RegistryMap,
  id: string
): { status: RegistryRemoveStatus; registries: RegistryMap } {
  if (!(id in registries)) return { status: "not-registered", registries };
  const { [id]: _removed, ...rest } = registries;
  return { status: "removed", registries: rest };
}
