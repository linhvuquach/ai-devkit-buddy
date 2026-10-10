import fs from "fs-extra";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { createSandbox, writeSkill, type Sandbox } from "../../../test-helpers";
import { addSkills, listGlobalSkills, listSkills, removeSkill } from "./installer.service";

let sandbox: Sandbox;
let registry: string;

beforeEach(async () => {
  sandbox = await createSandbox();
  registry = path.join(sandbox.root, "reg");
  await writeSkill(registry, "alpha");
  await writeSkill(registry, "beta");
  await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), {
    environments: ["claude", "codex"],
    skills: [],
    registries: { "me/reg": registry },
  });
});

const readConfig = () => fs.readJson(path.join(sandbox.project, ".ai-devkit-buddy.json"));
const claudeTarget = (name: string) => path.join(sandbox.project, ".claude/skills", name);

describe("addSkills", () => {
  it("symlinks into every configured environment and records the skill", async () => {
    const results = await addSkills("me/reg", ["alpha"], { projectDir: sandbox.project });

    expect(results).toEqual([
      { registry: "me/reg", name: "alpha", target: claudeTarget("alpha"), action: "symlinked" },
      {
        registry: "me/reg",
        name: "alpha",
        target: path.join(sandbox.project, ".agents/skills/alpha"),
        action: "symlinked",
      },
    ]);
    expect(await fs.readlink(claudeTarget("alpha"))).toBe(path.join(registry, "skills", "alpha"));
    expect((await readConfig()).skills).toEqual([{ registry: "me/reg", name: "alpha" }]);
  });

  it("copies with --mode copy and skips an existing target on re-install", async () => {
    const env = { projectDir: sandbox.project, environments: ["claude" as const] };
    const copied = await addSkills("me/reg", ["beta"], { ...env, mode: "copy" });
    expect(copied.map((result) => result.action)).toEqual(["copied"]);
    expect((await fs.lstat(claudeTarget("beta"))).isDirectory()).toBe(true);
    expect(await fs.readFile(path.join(claudeTarget("beta"), "SKILL.md"), "utf8")).toContain("name: beta");

    const again = await addSkills("me/reg", ["beta"], env);
    expect(again.map((result) => result.action)).toEqual(["skipped"]);
  });

  it("does not copy nested symlinks that escape the skill directory", async () => {
    const secret = path.join(sandbox.root, "secret.txt");
    await fs.writeFile(secret, "private");
    await fs.ensureDir(path.join(registry, "skills/beta/references"));
    await fs.symlink(secret, path.join(registry, "skills/beta/references/leak.txt"));
    await fs.writeFile(path.join(registry, "skills/beta/references/ok.md"), "fine");

    await addSkills("me/reg", ["beta"], { projectDir: sandbox.project, environments: ["claude"], mode: "copy" });

    expect((await fs.readdir(path.join(claudeTarget("beta"), "references"))).sort()).toEqual(["ok.md"]);
  });

  it("reports a conflict for copy over an existing symlink unless overwrite is set", async () => {
    const env = { projectDir: sandbox.project, environments: ["claude" as const] };
    await addSkills("me/reg", ["alpha"], env);

    const conflict = await addSkills("me/reg", ["alpha"], { ...env, mode: "copy" });
    expect(conflict.map((result) => result.action)).toEqual(["conflict"]);
    expect((await fs.lstat(claudeTarget("alpha"))).isSymbolicLink()).toBe(true);
    expect((await readConfig()).skills).toEqual([{ registry: "me/reg", name: "alpha" }]);

    const replaced = await addSkills("me/reg", ["alpha"], { ...env, mode: "copy", overwrite: true });
    expect(replaced.map((result) => result.action)).toEqual(["copied"]);
    expect((await fs.lstat(claudeTarget("alpha"))).isSymbolicLink()).toBe(false);
  });

  it("upserts the config idempotently and updates mode only when given", async () => {
    const env = { projectDir: sandbox.project };
    await addSkills("me/reg", ["alpha", "beta"], env);
    await addSkills("me/reg", ["alpha"], env);
    await addSkills("me/reg", ["beta"], { ...env, mode: "copy", overwrite: true });
    await addSkills("me/reg", ["beta"], env);

    expect((await readConfig()).skills).toEqual([
      { registry: "me/reg", name: "alpha" },
      { registry: "me/reg", name: "beta", mode: "copy" },
    ]);
  });

  it("rejects unknown skills and registries", async () => {
    await expect(addSkills("me/reg", ["missing"], { projectDir: sandbox.project })).rejects.toThrow(
      'Skill "missing" not found in registry me/reg.'
    );
    await expect(addSkills("me/nope", ["alpha"], { projectDir: sandbox.project })).rejects.toThrow(
      'Unknown registry "me/nope"'
    );
  });

  it("requires explicit environments for global installs and does not record them", async () => {
    await expect(addSkills("me/reg", ["alpha"], { projectDir: sandbox.project, global: true })).rejects.toThrow(
      "Global operations need explicit environments"
    );

    await addSkills("me/reg", ["alpha"], { projectDir: sandbox.project, global: true, environments: ["codex"] });
    expect(await listGlobalSkills()).toEqual([
      { environment: "codex", name: "alpha", path: path.join(sandbox.userHome, ".codex/skills/alpha") },
    ]);
    expect((await readConfig()).skills).toEqual([]);
  });
});

describe("listSkills and removeSkill", () => {
  it("lists per-environment state and removes from disk and config", async () => {
    await addSkills("me/reg", ["alpha"], { projectDir: sandbox.project });
    await fs.remove(path.join(sandbox.project, ".agents/skills/alpha"));

    expect(await listSkills(sandbox.project)).toEqual([
      {
        registry: "me/reg",
        name: "alpha",
        mode: "link",
        targets: [
          { environment: "claude", path: claudeTarget("alpha"), state: "symlink" },
          { environment: "codex", path: path.join(sandbox.project, ".agents/skills/alpha"), state: "missing" },
        ],
      },
    ]);

    expect(await removeSkill("alpha", { projectDir: sandbox.project })).toEqual([claudeTarget("alpha")]);
    expect(await fs.pathExists(path.join(registry, "skills", "alpha", "SKILL.md"))).toBe(true);
    expect((await readConfig()).skills).toEqual([]);
  });

  it("rejects path traversal on global removal", async () => {
    const victim = path.join(sandbox.userHome, ".claude", "keep");
    await fs.ensureDir(victim);

    await expect(
      removeSkill("../keep", { projectDir: sandbox.project, global: true, environments: ["claude"] })
    ).rejects.toThrow('Invalid skill name "../keep"');
    expect(await fs.pathExists(victim)).toBe(true);
  });
});
