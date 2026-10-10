import fs from "fs-extra";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { createSandbox, writeSkill, type Sandbox } from "../../../test-helpers";
import { discoverRegistrySkills, resolveContainedSkill } from "./registry-discovery";

let sandbox: Sandbox;
let root: string;

beforeEach(async () => {
  sandbox = await createSandbox();
  root = path.join(sandbox.root, "registry");
});

describe("discoverRegistrySkills", () => {
  it("returns valid skills sorted by name and skips invalid entries", async () => {
    await writeSkill(root, "zeta", "Zeta. Use when z.");
    await writeSkill(root, "alpha", "Alpha. Use when a.");
    await fs.ensureDir(path.join(root, "skills", "no-skill-md"));
    await writeSkill(root, "Bad_Name");
    await fs.outputFile(path.join(root, "skills", "loose-file"), "x");

    expect(await discoverRegistrySkills(root)).toEqual([
      { name: "alpha", description: "Alpha. Use when a." },
      { name: "zeta", description: "Zeta. Use when z." },
    ]);
  });

  it("rejects a symlinked skill that escapes skills/ but keeps one that stays inside", async () => {
    const outside = await writeSkill(path.join(sandbox.root, "elsewhere"), "secret");
    const inside = await writeSkill(root, "real");
    await fs.symlink(outside, path.join(root, "skills", "escape"));
    await fs.symlink(inside, path.join(root, "skills", "alias"));

    expect((await discoverRegistrySkills(root)).map((skill) => skill.name)).toEqual(["alias", "real"]);
    expect(await resolveContainedSkill(root, "escape")).toBe(null);
  });

  it("rejects a SKILL.md larger than 1 MB", async () => {
    await writeSkill(root, "small");
    const big = path.join(root, "skills", "big");
    await fs.outputFile(path.join(big, "SKILL.md"), "x".repeat(1024 * 1024 + 1));

    expect((await discoverRegistrySkills(root)).map((skill) => skill.name)).toEqual(["small"]);
  });

  it("rejects a registry with more entries than the cap", async () => {
    for (const name of ["a", "b", "c"]) await writeSkill(root, name);

    expect((await discoverRegistrySkills(root, { maxEntries: 3 })).length).toBe(3);
    await expect(discoverRegistrySkills(root, { maxEntries: 2 })).rejects.toThrow("has more than 2 entries");
  });

  it("refuses names that would traverse out of skills/", async () => {
    await writeSkill(root, "ok");
    expect(await resolveContainedSkill(root, "../skills/ok")).toBe(null);
    expect(await resolveContainedSkill(root, "ok")).toEqual({
      dir: path.join(root, "skills", "ok"),
      skillMd: path.join(root, "skills", "ok", "SKILL.md"),
    });
  });
});
