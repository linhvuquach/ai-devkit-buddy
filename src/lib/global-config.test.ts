import fs from "fs-extra";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSandbox, type Sandbox } from "../test-helpers";
import { addGlobalSkillRegistry, readGlobalConfig, removeGlobalSkillRegistry } from "./global-config";

let sandbox: Sandbox;
let file: string;

beforeEach(async () => {
  sandbox = await createSandbox();
  file = path.join(sandbox.home, "config.json");
});

describe("global config", () => {
  it("creates the file on first add and preserves unrelated keys", async () => {
    expect(await readGlobalConfig()).toBe(null);
    expect(await addGlobalSkillRegistry("a/b", "https://x.git", false)).toBe("added");
    await fs.writeJson(file, { ...(await fs.readJson(file)), theme: "dark" });
    expect(await removeGlobalSkillRegistry("a/b")).toBe("removed");

    expect(await fs.readJson(file)).toEqual({ registries: {}, theme: "dark" });
  });

  it("refuses to write when the existing file is unreadable", async () => {
    await fs.outputFile(file, "{ not json");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(await readGlobalConfig()).toBe(null);
    await expect(addGlobalSkillRegistry("a/b", "https://x.git", false)).rejects.toMatchObject({
      code: "GLOBAL_CONFIG_UNREADABLE",
    });
    await expect(removeGlobalSkillRegistry("a/b")).rejects.toMatchObject({ code: "GLOBAL_CONFIG_UNREADABLE" });
    expect(await fs.readFile(file, "utf8")).toBe("{ not json");
  });
});
