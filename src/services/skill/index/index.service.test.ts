import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";
import { beforeEach, describe, expect, it } from "vitest";
import { commitSkill, createGitRegistry, createSandbox, writeSkill, type Sandbox } from "../../../test-helpers";
import type { SkillEntry } from "../../../types";
import { findSkills, rankSkills, rebuildIndex } from "./index.service";

let sandbox: Sandbox;

beforeEach(async () => {
  sandbox = await createSandbox();
});

const entry = (name: string, registry: string, description = ""): SkillEntry => ({
  name,
  registry,
  description,
  lastIndexed: "",
});

describe("rankSkills", () => {
  it("orders exact, prefix, contains, then description; ties by name then registry", () => {
    const skills = [
      entry("unrelated", "a/a", "nothing here"),
      entry("about", "a/a", "mentions Review in the description"),
      entry("code-review-pro", "a/a"),
      entry("review-tools", "a/a"),
      entry("review", "z/z"),
      entry("review", "b/b"),
      entry("ai-review", "a/a"),
    ];

    expect(rankSkills(skills, "Review").map((skill) => `${skill.registry}:${skill.name}`)).toEqual([
      "b/b:review",
      "z/z:review",
      "a/a:review-tools",
      "a/a:ai-review",
      "a/a:code-review-pro",
      "a/a:about",
    ]);
  });
});

async function setupRegistries() {
  const local = path.join(sandbox.root, "local-reg");
  await writeSkill(local, "local-one");
  const origin = await createGitRegistry(path.join(sandbox.root, "origin"), ["git-one"]);
  await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), {
    environments: ["claude"],
    skills: [],
    registries: { "me/local": local, "me/git": `git+${pathToFileURL(origin).href}` },
  });
  return { local, origin };
}

const namesIn = (skills: SkillEntry[], registry: string) =>
  skills.filter((skill) => skill.registry === registry).map((skill) => skill.name);

describe("findSkills", () => {
  it("finds tech-interviewer first from the built-ins alone", async () => {
    const [first] = await findSkills(sandbox.project, "interview");
    expect([first.registry, first.name]).toEqual(["linhvuquach/ai-devkit-buddy", "tech-interviewer"]);
  });

  it("re-scans only local registries while the index is fresh, everything once it is stale", async () => {
    const { local, origin } = await setupRegistries();
    await findSkills(sandbox.project, "", { refresh: true });
    await writeSkill(local, "local-two");
    await commitSkill(origin, "git-two");

    const fresh = await findSkills(sandbox.project, "");
    expect(namesIn(fresh, "me/local")).toEqual(["local-one", "local-two"]);
    expect(namesIn(fresh, "me/git")).toEqual(["git-one"]);

    process.env.AI_DEVKIT_BUDDY_INDEX_TTL_MS = "0";
    const stale = await findSkills(sandbox.project, "");
    expect(namesIn(stale, "me/git")).toEqual(["git-one", "git-two"]);
  });

  it("applies --limit", async () => {
    expect((await findSkills(sandbox.project, "", { limit: 2 })).map((skill) => skill.name)).toEqual([
      "gamify-prototype",
      "goal-review-coach",
    ]);
  });
});

describe("rebuildIndex", () => {
  it("skips re-scanning a git registry whose HEAD has not moved", async () => {
    const { origin } = await setupRegistries();
    const output = path.join(sandbox.root, "index.json");
    await rebuildIndex(sandbox.project, output);

    const tampered = await fs.readJson(output);
    for (const skill of tampered.skills) skill.description = `stale ${skill.name}`;
    await fs.writeJson(output, tampered);

    const unchanged = await rebuildIndex(sandbox.project, output);
    const descriptions = (index: { skills: SkillEntry[] }, registry: string) =>
      index.skills.filter((skill) => skill.registry === registry).map((skill) => skill.description);
    expect(descriptions(unchanged, "me/git")).toEqual(["stale git-one"]);
    expect(descriptions(unchanged, "me/local")).toEqual(["local-one skill. Use when testing."]);

    await commitSkill(origin, "git-two");
    const moved = await rebuildIndex(sandbox.project, output);
    expect(descriptions(moved, "me/git")).toEqual([
      "git-one skill. Use when testing.",
      "git-two skill. Use when testing.",
    ]);
  });

  it("drops entries of registries that are no longer merged", async () => {
    await setupRegistries();
    const output = path.join(sandbox.root, "index.json");
    await rebuildIndex(sandbox.project, output);
    await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), { environments: ["claude"], skills: [] });

    const index = await rebuildIndex(sandbox.project, output);
    expect([...new Set(index.skills.map((skill) => skill.registry))]).toEqual(["linhvuquach/ai-devkit-buddy"]);
    expect(index.meta.registryHeads).toEqual({});
  });
});
