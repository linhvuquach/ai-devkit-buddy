import { describe, expect, it } from "vitest";
import { extractSkillDescription } from "./skill-description";

describe("extractSkillDescription", () => {
  it("reads the frontmatter description", () => {
    expect(extractSkillDescription("---\nname: x\ndescription: Does X. Use when Y.\n---\n# X\nBody")).toBe(
      "Does X. Use when Y."
    );
  });

  it("falls back to the first non-heading body line", () => {
    expect(extractSkillDescription("---\nname: x\n---\n\n# Title\n\nFirst real line.\nSecond.")).toBe(
      "First real line."
    );
  });

  it("scans the raw content when the frontmatter is malformed", () => {
    expect(extractSkillDescription("---\nname: [unclosed\n---\n# T\nRecovered line")).toBe("name: [unclosed");
  });

  it("returns a placeholder when there is nothing to use", () => {
    expect(extractSkillDescription("# Only a heading\n")).toBe("No description available");
  });
});
