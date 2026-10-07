import { describe, it, expect, vi, beforeEach } from "vitest";
import { init } from "./init";
import fs from "fs-extra";
import * as prompts from "@inquirer/prompts";

vi.mock("fs-extra");
vi.mock("@inquirer/prompts");

const dirent = (name: string, isDir: boolean) =>
  ({
    name,
    isFile: () => !isDir,
    isDirectory: () => isDir,
  }) as unknown as import("fs").Dirent;

describe("init command", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readdir").mockImplementation((async (dir: string) =>
      String(dir).endsWith("commands")
        ? [dirent("compact.md", false), dirent("notes.txt", false)]
        : [dirent("ts-code-kata", true), dirent("README.md", false)]) as never);
  });

  it("copies a command to .cursor/commands when cursor is selected", async () => {
    vi.spyOn(prompts, "select").mockResolvedValue("cursor");
    vi.spyOn(prompts, "checkbox").mockResolvedValue(["compact"]);

    await init({});

    expect(fs.copy).toHaveBeenCalledTimes(1);
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("src/templates/commands/compact.md"),
      expect.stringContaining(".cursor/commands/compact.md")
    );
  });

  it("copies a skill directory to .claude/skills when claude is selected", async () => {
    vi.spyOn(prompts, "select").mockResolvedValue("claude");
    vi.spyOn(prompts, "checkbox").mockResolvedValue(["ts-code-kata"]);

    await init({});

    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("src/templates/skills/ts-code-kata"),
      expect.stringContaining(".claude/skills/ts-code-kata")
    );
  });

  it("installs every discovered command and skill for both environments with --all", async () => {
    await init({ environment: "both", all: true });

    expect(fs.copy).toHaveBeenCalledTimes(4);
  });

  it("warns and skips unknown types", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await init({ environment: "claude", types: "does-not-exist" });

    expect(fs.copy).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });
});
