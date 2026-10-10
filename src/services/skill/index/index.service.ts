import path from "path";
import { BUNDLED_INDEX_FILE, defaultIndexPath, indexTtlMs } from "../../../constants";
import type { RegistrySource, SkillEntry, SkillIndexData } from "../../../types";
import { mapLimit } from "../../../util/concurrency";
import { errorMessage } from "../../../util/errors";
import { ui } from "../../../util/terminal-ui";
import { discoverRegistrySkills } from "../registry/registry-discovery";
import { hasCachedClone, prepareRegistry, registryHead } from "../registry/registry-source";
import { fetchMergedRegistry } from "../registry/registry.service";
import { INDEX_VERSION, readIndex, writeIndex } from "./index.repository";

const GIT_CONCURRENCY = 8;

export type ScanStatus = "scanned" | "unchanged" | "not-scanned" | "failed";

export interface ScanOutcome {
  registry: string;
  source: RegistrySource;
  status: ScanStatus;
  error?: string;
}

type ScanPolicy = (registryId: string, source: RegistrySource) => boolean;

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Exact name, then name prefix, then name substring, then description substring. */
export function rankSkills(skills: readonly SkillEntry[], keyword: string): SkillEntry[] {
  const needle = keyword.trim().toLowerCase();
  const rankOf = (skill: SkillEntry): number => {
    const name = skill.name.toLowerCase();
    if (name === needle) return 0;
    if (name.startsWith(needle)) return 1;
    if (name.includes(needle)) return 2;
    if (skill.description.toLowerCase().includes(needle)) return 3;
    return -1;
  };
  return skills
    .map((skill) => ({ skill, rank: rankOf(skill) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || compare(a.skill.name, b.skill.name) || compare(a.skill.registry, b.skill.registry))
    .map(({ skill }) => skill);
}

/** `updatedAt` starts at the epoch so a partial write never makes an unbuilt index look fresh. */
function emptyIndex(now: string): SkillIndexData {
  const epoch = new Date(0).toISOString();
  return { meta: { version: INDEX_VERSION, createdAt: now, updatedAt: epoch, registryHeads: {} }, skills: [] };
}

async function updateIndex(
  projectDir: string,
  previous: SkillIndexData,
  shouldScan: ScanPolicy,
  { output, rebuilt }: { output: string; rebuilt: boolean }
): Promise<{ index: SkillIndexData; outcomes: ScanOutcome[] }> {
  const registries = await fetchMergedRegistry(projectDir);
  const now = new Date().toISOString();
  const heads = { ...previous.meta.registryHeads };
  const entriesByRegistry = new Map<string, SkillEntry[]>();
  for (const entry of previous.skills) {
    entriesByRegistry.set(entry.registry, [...(entriesByRegistry.get(entry.registry) ?? []), entry]);
  }

  const outcomes = await mapLimit(Object.entries(registries), GIT_CONCURRENCY, async ([registry, source]) => {
    const outcome = (status: ScanStatus, error?: string): ScanOutcome => ({ registry, source, status, error });
    if (!shouldScan(registry, source)) return outcome("not-scanned");
    try {
      const root = await prepareRegistry(registry, source);
      const head = await registryHead(source, root);
      if (head !== undefined && head === heads[registry]) return outcome("unchanged");
      const skills = await discoverRegistrySkills(root);
      entriesByRegistry.set(
        registry,
        skills.map((skill) => ({
          name: skill.name,
          registry,
          path: path.join(root, "skills", skill.name),
          description: skill.description,
          lastIndexed: now,
        }))
      );
      if (head === undefined) delete heads[registry];
      else heads[registry] = head;
      return outcome("scanned");
    } catch (error) {
      ui.warn(`Could not index registry ${registry}: ${errorMessage(error)}`);
      return outcome("failed", errorMessage(error));
    }
  });

  const merged = (registry: string) => registry in registries;
  const index: SkillIndexData = {
    meta: {
      version: INDEX_VERSION,
      createdAt: previous.meta.createdAt,
      updatedAt: rebuilt ? now : previous.meta.updatedAt,
      registryHeads: Object.fromEntries(Object.entries(heads).filter(([registry]) => merged(registry))),
    },
    skills: [...entriesByRegistry.entries()]
      .filter(([registry]) => merged(registry))
      .flatMap(([, entries]) => entries)
      .sort((a, b) => compare(a.registry, b.registry) || compare(a.name, b.name)),
  };
  await writeIndex(output, index);
  return { index, outcomes };
}

async function loadOrSeed(output: string): Promise<SkillIndexData> {
  return (await readIndex(output)) ?? (await readIndex(BUNDLED_INDEX_FILE)) ?? emptyIndex(new Date().toISOString());
}

export async function ensureSkillIndex(
  projectDir: string,
  { refresh = false, output = defaultIndexPath() }: { refresh?: boolean; output?: string } = {}
): Promise<SkillIndexData> {
  const existing = await readIndex(output);
  const fresh =
    !refresh && existing !== null && Date.now() - Date.parse(existing.meta.updatedAt) < indexTtlMs();
  const policy: ScanPolicy = fresh
    ? (_, source) => source.kind !== "git"
    : (registry, source) => refresh || source.kind !== "git" || hasCachedClone(registry);
  const previous = existing ?? (await loadOrSeed(output));
  return (await updateIndex(projectDir, previous, policy, { output, rebuilt: !fresh })).index;
}

export async function findSkills(
  projectDir: string,
  keyword: string,
  { refresh = false, limit }: { refresh?: boolean; limit?: number } = {}
): Promise<SkillEntry[]> {
  const index = await ensureSkillIndex(projectDir, { refresh });
  const ranked = rankSkills(index.skills, keyword);
  return limit === undefined ? ranked : ranked.slice(0, limit);
}

export function rebuildIndex(projectDir: string, output: string = defaultIndexPath()): Promise<SkillIndexData> {
  return ensureSkillIndex(projectDir, { refresh: true, output });
}

/** Prepares (clone/pull/copy) and re-scans only the given registries. */
export async function reindexRegistries(projectDir: string, registryIds: readonly string[]): Promise<ScanOutcome[]> {
  const output = defaultIndexPath();
  const wanted = new Set(registryIds);
  const previous = await loadOrSeed(output);
  const { outcomes } = await updateIndex(projectDir, previous, (registry) => wanted.has(registry), {
    output,
    rebuilt: false,
  });
  return outcomes.filter((outcome) => wanted.has(outcome.registry));
}

/** Drops entries for registries that are no longer merged, without touching the network. */
export async function pruneIndex(projectDir: string): Promise<void> {
  const output = defaultIndexPath();
  const previous = await readIndex(output);
  if (previous) await updateIndex(projectDir, previous, () => false, { output, rebuilt: false });
}
