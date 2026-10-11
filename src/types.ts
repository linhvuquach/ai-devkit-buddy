export type EnvironmentCode = "claude" | "cursor" | "codex";
export type SkillInstallMode = "link" | "copy";

export interface EnvironmentDefinition {
  code: EnvironmentCode;
  name: string;
  /** Project-relative skill directory. */
  skillPath: string;
  /** Home-relative skill directory for global installs. */
  globalSkillPath: string;
  /** Project-relative directory for slash-command templates, used only by `init`. */
  commandPath?: string;
}

export interface SkillRef {
  registry: string;
  name: string;
  mode?: SkillInstallMode;
}

/** Registry id -> raw source string, as written in a config file. */
export type RegistryMap = Record<string, string>;

export interface ProjectConfig {
  environments: EnvironmentCode[];
  skills: SkillRef[];
  registries?: RegistryMap;
}

export interface GlobalConfig {
  registries: RegistryMap;
}

export type RegistrySource =
  | { kind: "git"; url: string }
  | { kind: "local"; path: string }
  | { kind: "bundled"; path: string };

export interface DiscoveredSkill {
  name: string;
  description: string;
}

export interface SkillEntry {
  name: string;
  registry: string;
  description: string;
  lastIndexed: string;
}

export interface SkillIndexData {
  meta: {
    version: number;
    createdAt: string;
    updatedAt: string;
    registryHeads: Record<string, string>;
  };
  skills: SkillEntry[];
}

export type SkillInstallAction = "symlinked" | "copied" | "skipped" | "conflict";

export interface SkillInstallResult {
  registry: string;
  name: string;
  target: string;
  action: SkillInstallAction;
}
