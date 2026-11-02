import type { RegistryAddStatus, RegistryRemoveStatus } from "../../lib/config";
import { NotFoundError } from "../../util/errors";
import { pruneIndex, reindexRegistries, type ScanOutcome } from "./index/index.service";
import { hasCachedClone } from "./registry/registry-source";
import {
  addRegistrySource,
  fetchMergedRegistry,
  removeRegistrySource,
  type RegistryScopeOptions,
} from "./registry/registry.service";

export async function addRegistry(
  id: string,
  source: string,
  options: RegistryScopeOptions & { force?: boolean }
): Promise<{ status: RegistryAddStatus; indexed: ScanOutcome | undefined }> {
  const status = await addRegistrySource(id, source, options);
  const [indexed] = await reindexRegistries(options.projectDir, [id]);
  return { status, indexed };
}

export async function removeRegistry(id: string, options: RegistryScopeOptions): Promise<RegistryRemoveStatus> {
  const status = await removeRegistrySource(id, options);
  await pruneIndex(options.projectDir);
  return status;
}

export type UpdateStatus = "updated" | "unchanged" | "skipped" | "failed";

export interface UpdateSummaryItem {
  registry: string;
  status: UpdateStatus;
  error?: string;
}

/** Pulls cached git registries (or one named registry) and re-indexes what changed. */
export async function updateRegistries(projectDir: string, registryId?: string): Promise<UpdateSummaryItem[]> {
  const registries = await fetchMergedRegistry(projectDir);
  if (registryId && !(registryId in registries)) throw new NotFoundError(`Unknown registry "${registryId}".`);
  const ids = registryId
    ? [registryId]
    : Object.entries(registries)
        .filter(([id, source]) => source.kind !== "git" || hasCachedClone(id))
        .map(([id]) => id);
  const outcomes = await reindexRegistries(projectDir, ids);
  return outcomes.map(({ registry, source, status, error }) => ({
    registry,
    error,
    status:
      status === "failed"
        ? "failed"
        : source.kind === "local"
          ? "skipped"
          : status === "unchanged"
            ? "unchanged"
            : "updated",
  }));
}
