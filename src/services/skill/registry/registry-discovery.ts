import fs from "fs";
import path from "path";
import { MAX_SKILL_ENTRIES, MAX_SKILL_MD_BYTES } from "../../../constants";
import type { DiscoveredSkill } from "../../../types";
import { ValidationError } from "../../../util/errors";
import { isInside } from "../../../util/fs";
import { extractSkillDescription } from "../skill-description";
import { isValidSkillName } from "../skill-validation";

export interface ContainedSkill {
  /** `<root>/skills/<name>`, unresolved, so installs link through the registry layout. */
  dir: string;
  skillMd: string;
}

/**
 * Security boundary for registry content: the skill dir (after following symlinks) must stay
 * inside `<root>/skills` and its SKILL.md must be a regular file within the size cap.
 */
export async function resolveContainedSkill(root: string, name: string): Promise<ContainedSkill | null> {
  if (!isValidSkillName(name)) return null;
  try {
    const skillsRoot = await fs.promises.realpath(path.join(root, "skills"));
    const dir = path.join(root, "skills", name);
    const real = await fs.promises.realpath(dir);
    if (!isInside(skillsRoot, real) || !(await fs.promises.stat(real)).isDirectory()) return null;
    const skillMd = path.join(real, "SKILL.md");
    const realSkillMd = await fs.promises.realpath(skillMd);
    if (!isInside(real, realSkillMd)) return null;
    const stat = await fs.promises.stat(realSkillMd);
    if (!stat.isFile() || stat.size > MAX_SKILL_MD_BYTES) return null;
    return { dir, skillMd: realSkillMd };
  } catch {
    return null;
  }
}

export async function discoverRegistrySkills(
  root: string,
  { maxEntries = MAX_SKILL_ENTRIES }: { maxEntries?: number } = {}
): Promise<DiscoveredSkill[]> {
  let directory: fs.Dir;
  try {
    directory = await fs.promises.opendir(path.join(root, "skills"));
  } catch {
    return [];
  }
  const names: string[] = [];
  let entries = 0;
  for await (const entry of directory) {
    if (++entries > maxEntries) {
      throw new ValidationError(`Registry at ${root} has more than ${maxEntries} entries in skills/.`);
    }
    if ((entry.isDirectory() || entry.isSymbolicLink()) && isValidSkillName(entry.name)) {
      names.push(entry.name);
    }
  }
  const skills: DiscoveredSkill[] = [];
  for (const name of names.sort()) {
    const contained = await resolveContainedSkill(root, name);
    if (!contained) continue;
    const content = await fs.promises.readFile(contained.skillMd, "utf8");
    skills.push({ name, description: extractSkillDescription(content) });
  }
  return skills;
}
