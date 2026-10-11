import fs from "fs-extra";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createProgram } from "./cli";
import { COMMAND_TEMPLATES_DIR, TEMPLATES_ROOT } from "./constants";
import { createSandbox, type Sandbox } from "./test-helpers";

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
    expect(output.length).toBe(builtins.length);
    expect(output[0]).toContain("gamify-prototype");
    expect(output[0]).toContain("claude:symlink cursor:symlink");

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

  it("lists the skills a registry offers without a project config", async () => {
    await run(sandbox.project, "skill", "list", "linhvuquach/ai-devkit-buddy");

    expect(process.exitCode).toBe(undefined);
    const builtins = (await fs.readdir(path.join(TEMPLATES_ROOT, "skills"))).sort();
    expect(output.filter((line) => !line.startsWith(" ")).slice(0, -1)).toEqual(builtins);
  });

  it("finds third-party skills on a fresh home from the bundled index without cloning", async () => {
    delete process.env.AI_DEVKIT_BUDDY_OFFICIAL_REGISTRIES;
    await run(sandbox.project, "skill", "find", "pdf", "--limit", "1");

    expect(output[0]).toContain("pdf");
    expect(output[0]).toContain("anthropics/skills");
    expect(await fs.pathExists(path.join(sandbox.home, "skills-cache", "anthropics"))).toBe(false);
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
