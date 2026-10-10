import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { getGlobalSkillPath, getSkillPath, parseEnvironmentCodes } from "./env";

describe("environment table", () => {
  it("maps each agent to its project and global skill dirs", () => {
    expect(getSkillPath("claude", "/p")).toBe(path.join("/p", ".claude/skills"));
    expect(getSkillPath("cursor", "/p")).toBe(path.join("/p", ".cursor/skills"));
    expect(getSkillPath("codex", "/p")).toBe(path.join("/p", ".agents/skills"));
    expect(getGlobalSkillPath("codex")).toBe(path.join(os.homedir(), ".codex/skills"));
  });

  it("parses csv and repeated codes, expanding legacy both and deduping", () => {
    expect(parseEnvironmentCodes("claude, cursor")).toEqual(["claude", "cursor"]);
    expect(parseEnvironmentCodes(["codex", "both", "cursor"])).toEqual(["codex", "cursor", "claude"]);
  });

  it("rejects unknown codes and lists the supported ones", () => {
    expect(() => parseEnvironmentCodes("claude,vim")).toThrow('Unknown environment "vim". Supported: claude, cursor, codex');
  });
});
