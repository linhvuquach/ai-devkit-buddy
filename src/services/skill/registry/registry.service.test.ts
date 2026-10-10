import fs from "fs-extra";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { TEMPLATES_ROOT } from "../../../constants";
import { createSandbox, type Sandbox } from "../../../test-helpers";
import { addRegistrySource, fetchMergedRegistry, removeRegistrySource } from "./registry.service";

let sandbox: Sandbox;

beforeEach(async () => {
  sandbox = await createSandbox();
});

describe("fetchMergedRegistry", () => {
  it("layers built-in < official < global < project", async () => {
    await fs.writeJson(process.env.AI_DEVKIT_BUDDY_OFFICIAL_REGISTRIES!, {
      registries: { "a/official": "https://o/a.git", "b/shared": "https://o/b.git" },
    });
    await fs.writeJson(path.join(sandbox.home, "config.json"), {
      registries: { "b/shared": "https://g/b.git", "c/shared": "https://g/c.git" },
    });
    await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), {
      environments: ["claude"],
      skills: [],
      registries: { "c/shared": "https://p/c.git", "linhvuquach/ai-devkit-buddy": "https://p/override.git" },
    });

    expect(await fetchMergedRegistry(sandbox.project)).toEqual({
      "linhvuquach/ai-devkit-buddy": { kind: "git", url: "https://p/override.git" },
      "a/official": { kind: "git", url: "https://o/a.git" },
      "b/shared": { kind: "git", url: "https://g/b.git" },
      "c/shared": { kind: "git", url: "https://p/c.git" },
    });
  });

  it("includes the bundled built-in registry and skips unparsable entries", async () => {
    await fs.writeJson(path.join(sandbox.project, ".ai-devkit-buddy.json"), {
      environments: [],
      skills: [],
      registries: { "bad id": "https://x.git", "me/missing": "./does-not-exist" },
    });

    expect(await fetchMergedRegistry(sandbox.project)).toEqual({
      "linhvuquach/ai-devkit-buddy": { kind: "bundled", path: TEMPLATES_ROOT },
    });
  });
});

describe("add/remove registry source", () => {
  it("stores project-local paths relative to the project and reports each status", async () => {
    await fs.ensureDir(path.join(sandbox.project, "vendor", "reg"));
    const scope = { projectDir: sandbox.project };

    expect(await addRegistrySource("me/reg", "./vendor/reg", scope)).toBe("added");
    expect(await addRegistrySource("me/reg", "./vendor/reg", scope)).toBe("already-registered");
    await expect(addRegistrySource("me/reg", "https://x/y.git", scope)).rejects.toThrow("--force");
    expect(await addRegistrySource("me/reg", "https://x/y.git", { ...scope, force: true })).toBe("updated");
    expect(await addRegistrySource("me/other", path.join(sandbox.project, "vendor", "reg"), scope)).toBe("added");

    expect((await fs.readJson(path.join(sandbox.project, ".ai-devkit-buddy.json"))).registries).toEqual({
      "me/reg": "https://x/y.git",
      "me/other": "./vendor/reg",
    });
    expect(await removeRegistrySource("me/reg", scope)).toBe("removed");
    expect(await removeRegistrySource("me/reg", scope)).toBe("not-registered");
  });

  it("writes global registries with absolute local paths and deletes the cache on removal", async () => {
    await fs.ensureDir(path.join(sandbox.project, "reg"));
    const cache = path.join(sandbox.home, "skills-cache", "me", "reg");
    await fs.ensureDir(cache);

    expect(await addRegistrySource("me/reg", "./reg", { projectDir: sandbox.project, global: true })).toBe("added");
    expect(await fs.readJson(path.join(sandbox.home, "config.json"))).toEqual({
      registries: { "me/reg": path.join(sandbox.project, "reg") },
    });
    expect(await removeRegistrySource("me/reg", { projectDir: sandbox.project, global: true })).toBe("removed");
    expect(await fs.pathExists(cache)).toBe(false);
  });
});
