import fs from "fs-extra";
import matter from "gray-matter";
import path from "path";
import { MAX_SKILL_MD_BYTES, TEMPLATES_ROOT } from "../constants";
import { resolveContainedSkill } from "../services/skill/registry/registry-discovery";
import { isValidSkillName } from "../services/skill/skill-validation";

export interface SkillProblem {
  skill: string;
  problem: string;
}

const REFERENCED_FILE = /\b(?:references|scripts|assets)\/[\w./-]*\.\w+/g;

async function lintSkill(root: string, name: string): Promise<string[]> {
  if (!isValidSkillName(name)) return ["folder name is not a valid skill name"];
  const skillMd = path.join(root, "skills", name, "SKILL.md");
  if (!(await fs.pathExists(skillMd))) return ["missing SKILL.md"];
  if ((await fs.stat(skillMd)).size > MAX_SKILL_MD_BYTES) return [`SKILL.md exceeds ${MAX_SKILL_MD_BYTES} bytes`];
  if (!(await resolveContainedSkill(root, name))) return ["skill resolves outside the registry's skills/ dir"];

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(await fs.readFile(skillMd, "utf8"));
  } catch (error) {
    return [`frontmatter does not parse: ${(error as Error).message}`];
  }
  const problems: string[] = [];
  const { name: declared, description } = parsed.data;
  if (declared !== name) problems.push(`frontmatter name ${JSON.stringify(declared)} does not match folder "${name}"`);
  if (typeof description !== "string" || !description.trim()) {
    problems.push("frontmatter description is empty");
  } else if (!description.includes("Use when")) {
    problems.push('description has no "Use when" trigger phrase');
  }
  for (const reference of new Set(parsed.content.match(REFERENCED_FILE) ?? [])) {
    if (!(await fs.pathExists(path.join(root, "skills", name, reference)))) {
      problems.push(`references missing file ${reference}`);
    }
  }
  return problems;
}

/** Lints every entry under `<root>/skills` against the authoring contract. */
export async function validateSkillRegistry(root: string): Promise<SkillProblem[]> {
  const entries = await fs.readdir(path.join(root, "skills"), { withFileTypes: true });
  const problems: SkillProblem[] = [];
  for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    for (const problem of await lintSkill(root, entry.name)) problems.push({ skill: entry.name, problem });
  }
  return problems;
}

if (require.main === module) {
  const root = path.resolve(process.argv[2] ?? TEMPLATES_ROOT);
  validateSkillRegistry(root).then((problems) => {
    for (const { skill, problem } of problems) console.error(`${skill}: ${problem}`);
    console.log(problems.length ? `${problems.length} problem(s) in ${root}` : `All skills in ${root} are valid.`);
    process.exitCode = problems.length ? 1 : 0;
  });
}
