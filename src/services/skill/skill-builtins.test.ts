import fs from "fs-extra";
import path from "path";
import { describe, expect, it } from "vitest";
import { TEMPLATES_ROOT } from "../../constants";
import { getBuiltinSkills } from "./skill-builtins";

describe("built-in skills", () => {
  it("are exactly the bundled template dirs with a SKILL.md", async () => {
    const skillsDir = path.join(TEMPLATES_ROOT, "skills");
    const dirs = (await fs.readdir(skillsDir))
      .filter((name) => fs.existsSync(path.join(skillsDir, name, "SKILL.md")))
      .sort();

    expect((await getBuiltinSkills()).map((skill) => skill.name)).toEqual(dirs);
  });
});
