import os from "os";
import path from "path";
import type { EnvironmentCode, EnvironmentDefinition } from "../types";
import { ValidationError } from "./errors";

const ENVIRONMENTS: readonly EnvironmentDefinition[] = [
  {
    code: "claude",
    name: "Claude Code",
    skillPath: ".claude/skills",
    globalSkillPath: ".claude/skills",
    commandPath: ".claude/commands",
  },
  {
    code: "cursor",
    name: "Cursor",
    skillPath: ".cursor/skills",
    globalSkillPath: ".cursor/skills",
    commandPath: ".cursor/commands",
  },
  {
    code: "codex",
    name: "OpenAI Codex",
    skillPath: ".agents/skills",
    globalSkillPath: ".codex/skills",
  },
];

const LEGACY_ALIASES: Record<string, EnvironmentCode[]> = { both: ["cursor", "claude"] };

export function getAllEnvironments(): readonly EnvironmentDefinition[] {
  return ENVIRONMENTS;
}

export function getEnvironment(code: EnvironmentCode): EnvironmentDefinition {
  return ENVIRONMENTS.find((env) => env.code === code)!;
}

export function getSkillPath(code: EnvironmentCode, projectDir: string): string {
  return path.join(projectDir, getEnvironment(code).skillPath);
}

export function getGlobalSkillPath(code: EnvironmentCode): string {
  return path.join(os.homedir(), getEnvironment(code).globalSkillPath);
}

/** Parses comma-separated or repeated env codes, expanding the legacy `both` alias. */
export function parseEnvironmentCodes(input: string | readonly string[]): EnvironmentCode[] {
  const tokens = (typeof input === "string" ? [input] : input)
    .flatMap((part) => part.split(","))
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  const codes = new Set<EnvironmentCode>();
  for (const token of tokens) {
    const alias = LEGACY_ALIASES[token];
    if (alias) {
      alias.forEach((code) => codes.add(code));
      continue;
    }
    const env = ENVIRONMENTS.find((candidate) => candidate.code === token);
    if (!env) {
      const supported = ENVIRONMENTS.map((candidate) => candidate.code).join(", ");
      throw new ValidationError(`Unknown environment "${token}". Supported: ${supported}`);
    }
    codes.add(env.code);
  }
  return [...codes];
}
