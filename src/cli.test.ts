import fs from "fs-extra";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createProgram } from "./cli";
import { COMMAND_TEMPLATES_DIR, TEMPLATES_ROOT } from "./constants";
import { createSandbox, writeSkill, type Sandbox } from "./test-helpers";

let sandbox: Sandbox;
let output: string[];

beforeEach(async () => {
  sandbox = await createSandbox();
  output = [];
  const capture = (...args: unknown[]) => void output.push(args.join(" "));
  vi.spyOn(console, "log").mockImplementation(capture);
  vi.spyOn(console, "warn").mockImplementation(capture);
  vi.spyOn(console, "error").mockImplementation(capture);
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

const run = (projectDir: string, ...args: string[]) => createProgram(projectDir).parseAsync(args, { from: "user" });

const stripAnsi = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");

async function linksUnder(projectDir: string, skillDir: string): Promise<Record<string, string>> {
  const dir = path.join(projectDir, skillDir);
  const names = (await fs.readdir(dir)).sort();
  return Object.fromEntries(await Promise.all(names.map(async (name) => [name, await fs.readlink(path.join(dir, name))])));
}

describe("cli end to end", () => {
  it("init --built-in, list, then install reproduces the same links in a fresh clone", async () => {
    await run(sandbox.project, "init", "-e", "claude,cursor", "--yes", "--built-in");
    expect(process.exitCode).toBe(undefined);

    const builtins = (await fs.readdir(path.join(TEMPLATES_ROOT, "skills"))).sort();
    const cache = path.join(sandbox.home, "skills-cache", "linhvuquach", "ai-devkit-buddy", "skills");
    const expectedLinks = Object.fromEntries(builtins.map((name) => [name, path.join(cache, name)]));
    expect(await linksUnder(sandbox.project, ".claude/skills")).toEqual(expectedLinks);
    expect(await linksUnder(sandbox.project, ".cursor/skills")).toEqual(expectedLinks);
    expect(await fs.readFile(path.join(sandbox.project, ".cursor/commands/compact.md"), "utf8")).toBe(
      await fs.readFile(path.join(COMMAND_TEMPLATES_DIR, "compact.md"), "utf8")
    );
    const config = await fs.readJson(path.join(sandbox.project, ".ai-devkit-buddy.json"));
    expect(config).toEqual({
      environments: ["claude", "cursor"],
      skills: builtins.map((name) => ({ registry: "linhvuquach/ai-devkit-buddy", name })),
    });

    output = [];
    await run(sandbox.project, "skill", "list");
    const listed = output.map(stripAnsi);
    expect(listed).toHaveLength(builtins.length + 4);
    expect(listed[0]).toBe("\nInstalled Skills:\n");
    expect(listed[3]).toContain("gamify-prototype");
    expect(listed[3]).toContain("linhvuquach/ai-devkit-buddy");
    expect(listed[3]).toContain("claude, cursor");
    expect(listed.at(-1)).toBe(`\nTotal: ${builtins.length} skills\n`);

    const clone = path.join(sandbox.root, "clone");
    await fs.outputJson(path.join(clone, ".ai-devkit-buddy.json"), config);
    await run(clone, "install");
    expect(process.exitCode).toBe(undefined);
    expect(await linksUnder(clone, ".claude/skills")).toEqual(expectedLinks);
    expect(await linksUnder(clone, ".cursor/skills")).toEqual(expectedLinks);
  });

  it("a second init reports every skill as skipped", async () => {
    await run(sandbox.project, "init", "-e", "codex", "--yes", "--built-in");
    output = [];
    await run(sandbox.project, "init", "-e", "codex", "--yes", "--built-in");

    const skillLines = output.filter((line) => line.includes("linhvuquach/ai-devkit-buddy/"));
    expect(skillLines.length).toBe((await fs.readdir(path.join(TEMPLATES_ROOT, "skills"))).length);
    expect(skillLines.every((line) => line.includes("skipped"))).toBe(true);
  });

  it("errors with the exact command to re-run instead of prompting", async () => {
    await run(sandbox.project, "init", "--yes");
    expect(process.exitCode).toBe(1);
    expect(output).toEqual(["--yes needs --environment. Run: ai-devkit-buddy init -e claude,cursor,codex --yes"]);
    expect(await fs.pathExists(path.join(sandbox.project, ".ai-devkit-buddy.json"))).toBe(false);
  });

  it("tells you how to install when the project has no skills", async () => {
    await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), {
      environments: ["claude"],
      skills: [],
    });
    await run(sandbox.project, "skill", "list");
    expect(output.map(stripAnsi)).toEqual([
      "No skills installed in this project.",
      "Install a skill with: ai-devkit-buddy skill add <registry> <name>",
    ]);
  });

  it("says when no global skills are installed", async () => {
    await run(sandbox.project, "skill", "list", "-g");
    expect(output.map(stripAnsi)).toEqual([
      "No global skills installed.",
      "Install a global skill with: ai-devkit-buddy skill add <registry> <name> --global",
    ]);
  });

  it("lists a skill folder that is not in the config", async () => {
    await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), {
      environments: ["claude"],
      skills: [{ registry: "me/reg", name: "ghost" }],
    });
    const skillsDir = path.join(sandbox.project, ".claude/skills");
    const cacheSkill = path.join(sandbox.home, "skills-cache", "acme", "widgets", "skills", "cached");
    await fs.ensureDir(cacheSkill);
    await fs.ensureDir(skillsDir);
    await fs.symlink(cacheSkill, path.join(skillsDir, "cached"));
    await fs.ensureDir(path.join(sandbox.root, "loose-skill"));
    await fs.symlink(path.join(sandbox.root, "loose-skill"), path.join(skillsDir, "loose"));

    await run(sandbox.project, "skill", "list");

    expect(output.map(stripAnsi)).toEqual([
      "\nInstalled Skills:\n",
      "  Skill Name  Registry      Environments  ",
      "  ────────────────────────────────────────",
      "  cached      acme/widgets  claude        ",
      "  loose       unknown       claude        ",
      "\nTotal: 2 skills\n",
    ]);
  });

  it("groups one global skill installed in several environments onto one row", async () => {
    const registry = path.join(sandbox.root, "reg");
    await writeSkill(registry, "alpha");
    await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), {
      environments: ["claude"],
      skills: [],
      registries: { "me/reg": registry },
    });
    await run(sandbox.project, "skill", "add", "me/reg", "alpha", "-g", "-e", "claude,codex");
    output = [];
    await run(sandbox.project, "skill", "list", "-g", "-e", "claude,codex");

    const visible = output.map(stripAnsi);
    const row = visible.find((line) => line.includes("alpha"));
    expect(visible[0]).toBe("\nGlobally Installed Skills:\n");
    expect(visible.filter((line) => line.includes("alpha"))).toEqual([row]);
    expect(row).toContain("claude, codex");
    expect(row).toContain(path.join(sandbox.userHome, ".claude/skills/alpha"));
    expect(row).toContain(path.join(sandbox.userHome, ".codex/skills/alpha"));
    expect(visible.at(-1)).toBe("\nTotal: 1 skill installation\n");
  });

  it("lists the skills a registry offers without a project config", async () => {
    await run(sandbox.project, "skill", "list", "linhvuquach/ai-devkit-buddy");

    expect(process.exitCode).toBe(undefined);
    const builtins = (await fs.readdir(path.join(TEMPLATES_ROOT, "skills"))).sort();
    expect(output.filter((line) => !line.startsWith(" ")).slice(0, -1)).toEqual(builtins);
  });

  it("finds third-party skills on a fresh home from the bundled index without cloning", async () => {
    delete process.env.AI_DEVKIT_BUDDY_OFFICIAL_REGISTRIES;
    await run(sandbox.project, "skill", "find", "pdf", "--limit", "1");

    const text = output.map(stripAnsi).join("\n");
    expect(text).toContain("pdf");
    expect(text).toContain("anthropics/skills");
    expect(await fs.pathExists(path.join(sandbox.home, "skills-cache", "anthropics"))).toBe(false);
  });

  it("says when a search matches nothing", async () => {
    await run(sandbox.project, "skill", "find", "zzz-no-such-skill-xyz");
    expect(output.map(stripAnsi)).toEqual([
      'No skills found matching "zzz-no-such-skill-xyz"',
      "Try a different keyword or use --refresh to update the skill index",
    ]);
  });

  it("prints the find table, a truncated description, and how many matches --limit hides", async () => {
    delete process.env.AI_DEVKIT_BUDDY_OFFICIAL_REGISTRIES;
    await run(sandbox.project, "skill", "find", "pdf", "--limit", "1");

    expect(output.map(stripAnsi)).toEqual([
      '\nFound 34 skills matching "pdf" (showing top 1):\n',
      "  Skill Name  Registry           Description                                                   ",
      "  ─────────────────────────────────────────────────────────────────────────────────────────────",
      "  pdf         anthropics/skills  Use this skill whenever the user wants to do anything wit...  ",
      "\nInstall with:",
      "  ai-devkit-buddy skill add anthropics/skills pdf",
      "\n33 more. Narrow the keyword, or use --limit <n> or --all to see them.",
    ]);
  });

  it("fills registries a fresh local index never scanned from the bundled index", async () => {
    delete process.env.AI_DEVKIT_BUDDY_OFFICIAL_REGISTRIES;
    const now = new Date().toISOString();
    await fs.outputJson(path.join(sandbox.home, "skill-index.json"), {
      meta: { version: 1, createdAt: now, updatedAt: now, registryHeads: {} },
      skills: [
        { name: "ts-code-kata", registry: "linhvuquach/ai-devkit-buddy", description: "kata", lastIndexed: now },
      ],
    });
    await run(sandbox.project, "skill", "find", "pdf", "--limit", "1");

    const text = output.map(stripAnsi).join("\n");
    expect(text).toContain("pdf");
    expect(text).toContain("anthropics/skills");
  });

  it("migrates a legacy tracker config on init", async () => {
    await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), {
      version: "0.0.1",
      environment: "both",
      initializedTypes: ["compact"],
    });
    await run(sandbox.project, "init", "-e", "codex", "--yes");

    expect(await fs.readJson(path.join(sandbox.project, ".ai-devkit-buddy.json"))).toEqual({
      environments: ["cursor", "claude", "codex"],
      skills: [],
    });
  });
});
