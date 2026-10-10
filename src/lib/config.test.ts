import { describe, expect, it } from "vitest";
import { parseProjectConfig, planSkillRegistryAdd, planSkillRegistryRemove } from "./config";

describe("parseProjectConfig", () => {
  it("reads the legacy tracker shape and drops its keys", () => {
    const legacy = {
      version: "0.0.1",
      environment: "both",
      initializedTypes: ["compact"],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    expect(parseProjectConfig(legacy)).toEqual({ environments: ["cursor", "claude"], skills: [] });
    expect(parseProjectConfig({ environment: "claude" })).toEqual({ environments: ["claude"], skills: [] });
  });

  it("reads the current shape", () => {
    const raw = {
      environments: ["codex"],
      skills: [{ registry: "a/b", name: "x", mode: "copy" }, { registry: "a/b", name: "y" }],
      registries: { "a/b": "./reg" },
    };
    expect(parseProjectConfig(raw)).toEqual(raw);
  });

  it("rejects malformed configs", () => {
    expect(() => parseProjectConfig({ environments: ["vim"] })).toThrow('Unknown environment "vim"');
    expect(() => parseProjectConfig({ skills: [{ name: "x" }] })).toThrow('each skill needs string "registry"');
    expect(() => parseProjectConfig({ skills: [{ registry: "a/b", name: "x", mode: "move" }] })).toThrow(
      'skill mode must be "link" or "copy"'
    );
    expect(() => parseProjectConfig({ registries: { "a/b": 1 } })).toThrow('"registries" must map');
  });
});

describe("registry planners", () => {
  it("adds, keeps, refuses conflicts without force, and updates with force", () => {
    expect(planSkillRegistryAdd({}, "a/b", "s1", false)).toEqual({ status: "added", registries: { "a/b": "s1" } });
    expect(planSkillRegistryAdd({ "a/b": "s1" }, "a/b", "s1", false).status).toBe("already-registered");
    expect(() => planSkillRegistryAdd({ "a/b": "s1" }, "a/b", "s2", false)).toThrow("--force");
    expect(planSkillRegistryAdd({ "a/b": "s1" }, "a/b", "s2", true)).toEqual({
      status: "updated",
      registries: { "a/b": "s2" },
    });
  });

  it("removes or reports not-registered", () => {
    expect(planSkillRegistryRemove({ "a/b": "s", "c/d": "t" }, "a/b")).toEqual({
      status: "removed",
      registries: { "c/d": "t" },
    });
    expect(planSkillRegistryRemove({}, "a/b").status).toBe("not-registered");
  });
});
