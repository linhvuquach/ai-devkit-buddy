import fs from "fs-extra";
import path from "path";
import { BUILTIN_SKILL_REGISTRY, TEMPLATES_ROOT, globalConfigPath, officialRegistryFile } from "../../../constants";
import {
  emptyProjectConfig,
  parseRegistryMap,
  planSkillRegistryAdd,
  planSkillRegistryRemove,
  readProjectConfig,
  writeProjectConfig,
  type RegistryAddStatus,
  type RegistryRemoveStatus,
} from "../../../lib/config";
import { addGlobalSkillRegistry, readGlobalConfig, removeGlobalSkillRegistry } from "../../../lib/global-config";
import type { RegistryMap, RegistrySource } from "../../../types";
import { errorMessage } from "../../../util/errors";
import { ui } from "../../../util/terminal-ui";
import { validateRegistryId } from "../skill-validation";
import { parseRegistrySource, registryCacheDir } from "./registry-source";

export type MergedRegistries = Record<string, RegistrySource>;

async function readOfficialRegistries(): Promise<RegistryMap> {
  const file = officialRegistryFile();
  if (!(await fs.pathExists(file))) return {};
  return parseRegistryMap((await fs.readJson(file)).registries, file);
}

function parseScope(registries: RegistryMap, baseDir: string): MergedRegistries {
  const parsed: MergedRegistries = {};
  for (const [id, raw] of Object.entries(registries)) {
    try {
      validateRegistryId(id);
      parsed[id] = parseRegistrySource(raw, baseDir);
    } catch (error) {
      ui.warn(`Ignoring registry "${id}": ${errorMessage(error)}`);
    }
  }
  return parsed;
}

/** Built-in < official list < global config < project config; later scope wins. */
export async function fetchMergedRegistry(projectDir: string): Promise<MergedRegistries> {
  const [official, global, project] = await Promise.all([
    readOfficialRegistries(),
    readGlobalConfig(),
    readProjectConfig(projectDir),
  ]);
  return {
    [BUILTIN_SKILL_REGISTRY]: { kind: "bundled", path: TEMPLATES_ROOT },
    ...parseScope(official, path.dirname(officialRegistryFile())),
    ...parseScope(global?.registries ?? {}, path.dirname(globalConfigPath())),
    ...parseScope(project?.registries ?? {}, projectDir),
  };
}

export interface RegistryScopeOptions {
  projectDir: string;
  global?: boolean;
}

/** Local sources are stored relative to the project for portability, absolute in the global config. */
function normalizeSource(raw: string, { projectDir, global }: RegistryScopeOptions): string {
  const source = parseRegistrySource(raw, projectDir);
  if (source.kind !== "local") return raw.trim();
  if (global) return source.path;
  const relative = path.relative(projectDir, source.path);
  if (relative === "") return ".";
  return relative.startsWith("..") || path.isAbsolute(relative) ? relative : `./${relative}`;
}

export async function addRegistrySource(
  id: string,
  rawSource: string,
  options: RegistryScopeOptions & { force?: boolean }
): Promise<RegistryAddStatus> {
  validateRegistryId(id);
  const source = normalizeSource(rawSource, options);
  const force = options.force ?? false;
  if (options.global) return addGlobalSkillRegistry(id, source, force);
  const config = (await readProjectConfig(options.projectDir)) ?? emptyProjectConfig();
  const plan = planSkillRegistryAdd(config.registries ?? {}, id, source, force);
  if (plan.status !== "already-registered") {
    await writeProjectConfig(options.projectDir, { ...config, registries: plan.registries });
  }
  return plan.status;
}

export async function removeRegistrySource(id: string, options: RegistryScopeOptions): Promise<RegistryRemoveStatus> {
  validateRegistryId(id);
  if (options.global) {
    const status = await removeGlobalSkillRegistry(id);
    await fs.remove(registryCacheDir(id));
    return status;
  }
  const config = await readProjectConfig(options.projectDir);
  if (!config) return "not-registered";
  const plan = planSkillRegistryRemove(config.registries ?? {}, id);
  if (plan.status === "removed") {
    await writeProjectConfig(options.projectDir, { ...config, registries: plan.registries });
  }
  return plan.status;
}
