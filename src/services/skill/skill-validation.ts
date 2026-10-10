import { ValidationError } from "../../util/errors";

const SKILL_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const REGISTRY_ID_PATTERN = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;

export function isValidSkillName(name: string): boolean {
  return SKILL_NAME_PATTERN.test(name);
}

export function validateSkillName(name: string): void {
  if (!isValidSkillName(name)) {
    throw new ValidationError(
      `Invalid skill name "${name}". Use lowercase letters, digits and single hyphens (e.g. my-skill).`
    );
  }
}

export function validateRegistryId(id: string): void {
  if (!REGISTRY_ID_PATTERN.test(id)) {
    throw new ValidationError(`Invalid registry id "${id}". Expected the form org/repo.`);
  }
}
