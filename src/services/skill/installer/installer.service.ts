import fs from "fs-extra";
import path from "path";
import { CLI_NAME } from "../../../constants";
import {
  addEnvironments,
  emptyProjectConfig,
  readProjectConfig,
  removeSkillRef,
  upsertSkill,
  writeProjectConfig,
} from "../../../lib/config";
import type {
  DiscoveredSkill,
  EnvironmentCode,
  SkillInstallAction,
  SkillInstallMode,
  SkillInstallResult,
} from "../../../types";
import { getAllEnvironments, getGlobalSkillPath, getSkillPath } from "../../../util/env";
import { CliError, ConfigNotFoundError, NotFoundError, ValidationError } from "../../../util/errors";
import { isInside, lstatOrNull } from "../../../util/fs";
import { discoverRegistrySkills, resolveContainedSkill } from "../registry/registry-discovery";
import { prepareRegistry } from "../registry/registry-source";
import { fetchMergedRegistry } from "../registry/registry.service";
import { validateRegistryId, validateSkillName } from "../skill-validation";

export interface InstallScope {
  projectDir: string;
  global?: boolean;
  environments?: EnvironmentCode[];
}

export interface AddSkillsOptions extends InstallScope {
  mode?: SkillInstallMode;
  overwrite?: boolean;
}

async function prepareRegistryById(projectDir: string, registryId: string): Promise<string> {
  validateRegistryId(registryId);
  const registries = await fetchMergedRegistry(projectDir);
  const source = registries[registryId];
  if (!source) {
    throw new NotFoundError(
      `Unknown registry "${registryId}". Register it with: ${CLI_NAME} skill add-registry ${registryId} <source>`
    );
  }
  return prepareRegistry(registryId, source);
}

async function resolveEnvironments({ projectDir, global, environments }: InstallScope): Promise<EnvironmentCode[]> {
  if (global) {
    if (!environments?.length) {
      throw new ValidationError(`Global operations need explicit environments, e.g. --global --env claude`);
    }
    return environments;
  }
  if (environments?.length) return environments;
  const config = await readProjectConfig(projectDir);
  if (!config?.environments.length) {
    throw new ConfigNotFoundError(`No environments configured for this project. Run: ${CLI_NAME} init`);
  }
  return config.environments;
}

/** One entry per distinct directory, so environments that share a skill dir install once. */
function skillRoots(codes: readonly EnvironmentCode[], { projectDir, global }: InstallScope): string[] {
  return [...new Set(codes.map((code) => (global ? getGlobalSkillPath(code) : getSkillPath(code, projectDir))))];
}

async function installOne(
  source: string,
  target: string,
  mode: SkillInstallMode,
  overwrite: boolean
): Promise<SkillInstallAction> {
  const existing = await lstatOrNull(target);
  if (existing) {
    if (mode !== "copy" || !existing.isSymbolicLink()) return "skipped";
    if (!overwrite) return "conflict";
    await fs.remove(target);
  }
  await fs.ensureDir(path.dirname(target));
  if (mode === "link") {
    try {
      await fs.symlink(source, target, "dir");
      return "symlinked";
    } catch {
      // Symlinks can be unavailable (e.g. Windows without developer mode); a copy still works.
    }
  }
  const realSource = await fs.realpath(source);
  await fs.copy(source, target, {
    dereference: true,
    filter: async (entry) => {
      const real = await fs.realpath(entry).catch(() => null);
      return real !== null && (real === realSource || isInside(realSource, real));
    },
  });
  return "copied";
}

export async function addSkills(
  registryId: string,
  names: readonly string[],
  options: AddSkillsOptions
): Promise<SkillInstallResult[]> {
  names.forEach(validateSkillName);
  const environments = await resolveEnvironments(options);
  const root = await prepareRegistryById(options.projectDir, registryId);
  const sources = new Map<string, string>();
  for (const name of names) {
    const contained = await resolveContainedSkill(root, name);
    if (!contained) throw new NotFoundError(`Skill "${name}" not found in registry ${registryId}.`);
    sources.set(name, contained.dir);
  }

  const mode = options.mode ?? "link";
  const results: SkillInstallResult[] = [];
  for (const dir of skillRoots(environments, options)) {
    for (const [name, source] of sources) {
      const target = path.join(dir, name);
      const action = await installOne(source, target, mode, options.overwrite ?? false);
      results.push({ registry: registryId, name, target, action });
    }
  }

  if (!options.global) {
    let config = addEnvironments(
      (await readProjectConfig(options.projectDir)) ?? emptyProjectConfig(),
      environments
    );
    const conflicted = new Set(results.filter((r) => r.action === "conflict").map((r) => r.name));
    for (const name of names) {
      const recordMode = options.mode && !conflicted.has(name);
      config = upsertSkill(config, { registry: registryId, name, ...(recordMode ? { mode: options.mode } : {}) });
    }
    await writeProjectConfig(options.projectDir, config);
  }
  return results;
}

export async function listInstallableSkills(projectDir: string, registryId: string): Promise<DiscoveredSkill[]> {
  return discoverRegistrySkills(await prepareRegistryById(projectDir, registryId));
}

export type InstalledState = "symlink" | "directory" | "missing";

export interface ProjectSkillStatus {
  registry: string;
  name: string;
  mode: SkillInstallMode;
  targets: { environment: EnvironmentCode; path: string; state: InstalledState }[];
}

async function installedState(target: string): Promise<InstalledState> {
  const stat = await lstatOrNull(target);
  if (!stat) return "missing";
  return stat.isSymbolicLink() ? "symlink" : "directory";
}

export async function listSkills(projectDir: string): Promise<ProjectSkillStatus[]> {
  const config = await readProjectConfig(projectDir);
  if (!config) throw new ConfigNotFoundError(`No project config found. Run: ${CLI_NAME} init`);
  return Promise.all(
    config.skills.map(async (skill) => ({
      registry: skill.registry,
      name: skill.name,
      mode: skill.mode ?? "link",
      targets: await Promise.all(
        config.environments.map(async (environment) => {
          const target = path.join(getSkillPath(environment, projectDir), skill.name);
          return { environment, path: target, state: await installedState(target) };
        })
      ),
    }))
  );
}

export interface GlobalSkill {
  environment: EnvironmentCode;
  name: string;
  path: string;
}

export async function listGlobalSkills(environments?: EnvironmentCode[]): Promise<GlobalSkill[]> {
  const codes = environments?.length ? environments : getAllEnvironments().map((env) => env.code);
  const skills: GlobalSkill[] = [];
  for (const environment of codes) {
    const dir = getGlobalSkillPath(environment);
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (entry.isDirectory() || entry.isSymbolicLink()) {
        skills.push({ environment, name: entry.name, path: path.join(dir, entry.name) });
      }
    }
  }
  return skills;
}

export async function removeSkill(name: string, scope: InstallScope): Promise<string[]> {
  validateSkillName(name);
  const environments = await resolveEnvironments(scope);
  const removed: string[] = [];
  for (const root of skillRoots(environments, scope)) {
    const target = path.join(root, name);
    if (scope.global && !isInside(root, path.resolve(target))) {
      throw new CliError(`Refusing to remove ${target}: outside ${root}`, "PATH_TRAVERSAL");
    }
    if (await lstatOrNull(target)) {
      await fs.remove(target);
      removed.push(target);
    }
  }
  if (!scope.global) {
    const config = await readProjectConfig(scope.projectDir);
    if (config) await writeProjectConfig(scope.projectDir, removeSkillRef(config, name));
  }
  return removed;
}
