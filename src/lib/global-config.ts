import fs from "fs-extra";
import path from "path";
import { globalConfigPath } from "../constants";
import type { GlobalConfig, RegistryMap } from "../types";
import { CliError, errorMessage } from "../util/errors";
import { ui } from "../util/terminal-ui";
import {
  parseRegistryMap,
  planSkillRegistryAdd,
  planSkillRegistryRemove,
  type RegistryAddStatus,
  type RegistryRemoveStatus,
} from "./config";

type GlobalConfigState =
  | { kind: "missing" }
  | { kind: "ok"; config: GlobalConfig }
  | { kind: "unreadable"; reason: string };

async function load(): Promise<GlobalConfigState> {
  const file = globalConfigPath();
  if (!(await fs.pathExists(file))) return { kind: "missing" };
  try {
    const raw = await fs.readJson(file);
    return { kind: "ok", config: { ...raw, registries: parseRegistryMap(raw.registries, file) } };
  } catch (error) {
    return { kind: "unreadable", reason: errorMessage(error) };
  }
}

export async function readGlobalConfig(): Promise<GlobalConfig | null> {
  const state = await load();
  if (state.kind === "unreadable") {
    ui.warn(`Ignoring unreadable global config ${globalConfigPath()}: ${state.reason}`);
    return null;
  }
  return state.kind === "ok" ? state.config : null;
}

async function mutateRegistries<S>(
  plan: (registries: RegistryMap) => { status: S; registries: RegistryMap }
): Promise<S> {
  const state = await load();
  if (state.kind === "unreadable") {
    throw new CliError(
      `Refusing to modify ${globalConfigPath()} because it cannot be read (${state.reason}). Fix or delete it first.`,
      "GLOBAL_CONFIG_UNREADABLE"
    );
  }
  const config = state.kind === "ok" ? state.config : { registries: {} };
  const { status, registries } = plan(config.registries);
  if (registries !== config.registries) {
    const file = globalConfigPath();
    await fs.ensureDir(path.dirname(file));
    await fs.writeJson(file, { ...config, registries }, { spaces: 2 });
  }
  return status;
}

export function addGlobalSkillRegistry(id: string, source: string, force: boolean): Promise<RegistryAddStatus> {
  return mutateRegistries((registries) => planSkillRegistryAdd(registries, id, source, force));
}

export function removeGlobalSkillRegistry(id: string): Promise<RegistryRemoveStatus> {
  return mutateRegistries((registries) => planSkillRegistryRemove(registries, id));
}
