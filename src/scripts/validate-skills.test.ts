import fs from "fs-extra";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { createSandbox, writeSkill, type Sandbox } from "../test-helpers";
import { validateSkillRegistry } from "./validate-skills";

let sandbox: Sandbox;

beforeEach(async () => {
  sandbox = await createSandbox();
});

describe("validateSkillRegistry", () => {
  it("reports each authoring-contract violation", async () => {
    const root = path.join(sandbox.root, "reg");
    const good = await writeSkill(root, "good");
    await fs.appendFile(path.join(good, "SKILL.md"), "See references/guide.md.\n");
    await fs.outputFile(path.join(good, "references", "guide.md"), "ok");
    await fs.outputFile(
      path.join(root, "skills", "drifted", "SKILL.md"),
      "---\nname: other\ndescription: Does things.\n---\nRead scripts/run.sh first.\n"
    );
    await fs.ensureDir(path.join(root, "skills", "empty"));
    await fs.ensureDir(path.join(root, "skills", "Bad_Name"));

    expect(await validateSkillRegistry(root)).toEqual([
      { skill: "Bad_Name", problem: "folder name is not a valid skill name" },
      { skill: "drifted", problem: 'frontmatter name "other" does not match folder "drifted"' },
      { skill: "drifted", problem: 'description has no "Use when" trigger phrase' },
      { skill: "drifted", problem: "references missing file scripts/run.sh" },
      { skill: "empty", problem: "missing SKILL.md" },
    ]);
  });
});
