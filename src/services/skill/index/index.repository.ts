import fs from "fs-extra";
import path from "path";
import type { SkillEntry, SkillIndexData } from "../../../types";

export const INDEX_VERSION = 1;

function isSkillEntry(value: unknown): value is SkillEntry {
  const entry = value as SkillEntry;
  return (
    typeof entry === "object" &&
    entry !== null &&
    ["name", "registry", "description", "lastIndexed"].every(
      (key) => typeof entry[key as keyof SkillEntry] === "string"
    )
  );
}

function parseIndex(raw: unknown): SkillIndexData | null {
  const data = raw as SkillIndexData;
  if (
    typeof data !== "object" ||
    data === null ||
    typeof data.meta?.updatedAt !== "string" ||
    typeof data.meta.registryHeads !== "object" ||
    !Array.isArray(data.skills)
  ) {
    return null;
  }
  return {
    meta: {
      version: INDEX_VERSION,
      createdAt: typeof data.meta.createdAt === "string" ? data.meta.createdAt : data.meta.updatedAt,
      updatedAt: data.meta.updatedAt,
      registryHeads: { ...data.meta.registryHeads },
    },
    skills: data.skills.filter(isSkillEntry),
  };
}

/** Returns null when the file is missing or not a valid index; the index is derived data. */
export async function readIndex(file: string): Promise<SkillIndexData | null> {
  try {
    return parseIndex(await fs.readJson(file));
  } catch {
    return null;
  }
}

export async function writeIndex(file: string, data: SkillIndexData): Promise<void> {
  await fs.ensureDir(path.dirname(file));
  await fs.writeJson(file, data, { spaces: 2 });
}
