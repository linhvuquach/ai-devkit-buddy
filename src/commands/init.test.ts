import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { init } from "./init";
import fs from "fs-extra";
import path from "path";
import * as prompts from "@inquirer/prompts";

vi.mock("fs-extra");
vi.mock("@inquirer/prompts");

describe("init command", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should generate cursor prompts when cursor is selected", async () => {
    // Mock user selection
    vi.spyOn(prompts, "select").mockResolvedValue("cursor");
    vi.spyOn(prompts, "checkbox").mockResolvedValue([
      "onboarding",
      "capture-knowledge",
    ]);

    // Mock fs existence check
    vi.spyOn(fs, "existsSync").mockReturnValue(true);

    await init({});

    // Verify fs.copy was called
    expect(fs.ensureDir).toHaveBeenCalledWith(
      expect.stringContaining(".cursor/commands")
    );
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("src/templates/commands/onboarding.md"),
      expect.stringContaining(".cursor/commands/onboarding.md")
    );
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("src/templates/commands/capture-knowledge.md"),
      expect.stringContaining(".cursor/commands/capture-knowledge.md")
    );
  });

  it("should generate claude prompts when claude is selected", async () => {
    // Mock user selection
    vi.spyOn(prompts, "select").mockResolvedValue("claude");
    vi.spyOn(prompts, "checkbox").mockResolvedValue([
      "onboarding",
      "capture-knowledge",
    ]);

    // Mock fs existence check
    vi.spyOn(fs, "existsSync").mockReturnValue(true);

    await init({});

    // Verify fs.copy was called
    expect(fs.ensureDir).toHaveBeenCalledWith(
      expect.stringContaining(".claude/commands")
    );
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("src/templates/commands/onboarding.md"),
      expect.stringContaining(".claude/commands/onboarding.md")
    );
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("src/templates/commands/capture-knowledge.md"),
      expect.stringContaining(".claude/commands/capture-knowledge.md")
    );
  });
});
