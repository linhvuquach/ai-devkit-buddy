import { describe, expect, it } from "vitest";
import { isValidSkillName, validateRegistryId, validateSkillName } from "./skill-validation";

describe("skill names", () => {
  it.each(["a", "my-skill", "skill2", "a-b-c-1"])("accepts %s", (name) => {
    expect(isValidSkillName(name)).toBe(true);
  });

  it.each(["", "-skill", "skill-", "my--skill", "My-Skill", "my_skill", "../escape", "a/b", "pattern match"])(
    "rejects %j",
    (name) => {
      expect(isValidSkillName(name)).toBe(false);
      expect(() => validateSkillName(name)).toThrow(`Invalid skill name "${name}"`);
    }
  );
});

describe("registry ids", () => {
  it.each(["org/repo", "Org_1/repo-2"])("accepts %s", (id) => {
    expect(() => validateRegistryId(id)).not.toThrow();
  });

  it.each(["repo", "org/repo/extra", "../repo", "org/..", "~/repo", "org/~", "org/re.po", ""])("rejects %j", (id) => {
    expect(() => validateRegistryId(id)).toThrow(`Invalid registry id "${id}"`);
  });
});
