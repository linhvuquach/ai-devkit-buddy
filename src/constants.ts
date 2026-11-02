import fs from "fs";
import os from "os";
import path from "path";

export const CLI_NAME = "ai-devkit-buddy";
export const CONFIG_FILE = ".ai-devkit-buddy.json";
export const HOME_DIR = ".ai-devkit-buddy";
export const ENV_PREFIX = "AI_DEVKIT_BUDDY";
export const BUILTIN_SKILL_REGISTRY = "linhvuquach/ai-devkit-buddy";

export const DEFAULT_INDEX_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_SKILL_ENTRIES = 10_000;
export const MAX_SKILL_MD_BYTES = 1024 * 1024;

function findPackageRoot(start: string): string {
  let dir = start;
  while (true) {
    const manifest = path.join(dir, "package.json");
    if (fs.existsSync(manifest)) {
      const { name } = JSON.parse(fs.readFileSync(manifest, "utf8"));
      if (name === CLI_NAME) return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error(`Cannot locate the ${CLI_NAME} package root from ${start}`);
    dir = parent;
  }
}

export const PACKAGE_ROOT = findPackageRoot(__dirname);
export const PACKAGE_VERSION: string = JSON.parse(
  fs.readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf8")
).version;
export const TEMPLATES_ROOT = path.join(PACKAGE_ROOT, "src", "templates");
export const COMMAND_TEMPLATES_DIR = path.join(TEMPLATES_ROOT, "commands");
export const BUNDLED_INDEX_FILE = path.join(PACKAGE_ROOT, "skills", "index.json");

export function officialRegistryFile(): string {
  return process.env[`${ENV_PREFIX}_OFFICIAL_REGISTRIES`] ?? path.join(PACKAGE_ROOT, "skills", "registry.json");
}

export function homeDir(): string {
  return process.env[`${ENV_PREFIX}_HOME`] ?? path.join(os.homedir(), HOME_DIR);
}

export function skillCacheDir(): string {
  return path.join(homeDir(), "skills-cache");
}

export function defaultIndexPath(): string {
  return path.join(homeDir(), "skill-index.json");
}

export function globalConfigPath(): string {
  return path.join(homeDir(), "config.json");
}

export function indexTtlMs(): number {
  const raw = process.env[`${ENV_PREFIX}_INDEX_TTL_MS`]?.trim();
  const ttl = raw ? Number(raw) : NaN;
  return Number.isFinite(ttl) && ttl >= 0 ? ttl : DEFAULT_INDEX_TTL_MS;
}
