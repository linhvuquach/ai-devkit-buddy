import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";
import { beforeEach, describe, expect, it } from "vitest";
import { commitSkill, createGitRegistry, createSandbox, type Sandbox } from "../../../test-helpers";
import { discoverRegistrySkills } from "./registry-discovery";
import { parseRegistrySource, prepareRegistry } from "./registry-source";

let sandbox: Sandbox;

beforeEach(async () => {
  sandbox = await createSandbox();
});

describe("parseRegistrySource", () => {
  it("parses git URLs as git", () => {
    expect(parseRegistrySource("https://github.com/org/repo.git", "/x")).toEqual({
      kind: "git",
      url: "https://github.com/org/repo.git",
    });
    expect(parseRegistrySource("git@github.com:org/repo.git", "/x")).toEqual({
      kind: "git",
      url: "git@github.com:org/repo.git",
    });
  });

  it("forces git for a git+ prefix", () => {
    expect(parseRegistrySource("git+file:///srv/repo", "/x")).toEqual({ kind: "git", url: "file:///srv/repo" });
  });

  it("resolves file://, absolute and relative paths to a realpath'd local dir", async () => {
    const dir = path.join(sandbox.root, "local-reg");
    await fs.ensureDir(dir);
    const expected = { kind: "local", path: dir };

    expect(parseRegistrySource(pathToFileURL(dir).href, "/x")).toEqual(expected);
    expect(parseRegistrySource(dir, "/x")).toEqual(expected);
    expect(parseRegistrySource("./local-reg", sandbox.root)).toEqual(expected);
    expect(parseRegistrySource("../local-reg", sandbox.project)).toEqual(expected);
  });

  it("rejects missing or non-directory local paths", async () => {
    await fs.outputFile(path.join(sandbox.root, "file.txt"), "x");
    expect(() => parseRegistrySource("./missing", sandbox.root)).toThrow("Local registry path does not exist");
    expect(() => parseRegistrySource("./file.txt", sandbox.root)).toThrow("is not a directory");
  });
});

describe("prepareRegistry", () => {
  it("clones a git registry into the cache, then pulls a new commit", async () => {
    const origin = await createGitRegistry(path.join(sandbox.root, "origin"), ["first"]);
    const source = { kind: "git" as const, url: pathToFileURL(origin).href };

    const root = await prepareRegistry("acme/skills", source);
    expect(root).toBe(path.join(sandbox.home, "skills-cache", "acme", "skills"));
    expect((await discoverRegistrySkills(root)).map((skill) => skill.name)).toEqual(["first"]);

    await commitSkill(origin, "second");
    await prepareRegistry("acme/skills", source);
    expect((await discoverRegistrySkills(root)).map((skill) => skill.name)).toEqual(["first", "second"]);
  });

  it("copies a bundled registry into the cache and drops stale skills", async () => {
    const bundled = path.join(sandbox.root, "bundled");
    await fs.outputFile(path.join(bundled, "skills", "one", "SKILL.md"), "---\ndescription: One\n---\n");
    const stale = path.join(sandbox.home, "skills-cache", "me", "builtin", "skills", "gone");
    await fs.outputFile(path.join(stale, "SKILL.md"), "x");

    const root = await prepareRegistry("me/builtin", { kind: "bundled", path: bundled });
    expect(await fs.readdir(path.join(root, "skills"))).toEqual(["one"]);
  });

  it("uses a local registry in place", async () => {
    expect(await prepareRegistry("me/local", { kind: "local", path: sandbox.project })).toBe(sandbox.project);
  });
});
