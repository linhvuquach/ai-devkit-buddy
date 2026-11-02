import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { skillCacheDir } from "../../../constants";
import type { RegistrySource } from "../../../types";
import { ValidationError } from "../../../util/errors";
import { headOf, pullShallow, sparseClone } from "../../../util/git";

const GIT_FORCE_PREFIX = "git+";

/**
 * Parses a registry source string from a config file or CLI flag.
 * Local sources (`file://`, absolute, `./`, `../`) resolve against `baseDir` and must be
 * existing directories. `git+<url>` forces a git clone, e.g. `git+file:///path/to/repo`.
 */
export function parseRegistrySource(raw: string, baseDir: string): RegistrySource {
  const value = raw.trim();
  if (value.startsWith(GIT_FORCE_PREFIX)) {
    return { kind: "git", url: value.slice(GIT_FORCE_PREFIX.length) };
  }
  const localPath = value.startsWith("file://")
    ? fileURLToPath(value)
    : path.isAbsolute(value) || value.startsWith("./") || value.startsWith("../") || value === "."
      ? path.resolve(baseDir, value)
      : null;
  if (localPath === null) {
    if (!value) throw new ValidationError("Registry source is empty.");
    return { kind: "git", url: value };
  }
  let resolved: string;
  try {
    resolved = fs.realpathSync(localPath);
  } catch {
    throw new ValidationError(`Local registry path does not exist: ${localPath}`);
  }
  if (!fs.statSync(resolved).isDirectory()) {
    throw new ValidationError(`Local registry path is not a directory: ${resolved}`);
  }
  return { kind: "local", path: resolved };
}

export function registryCacheDir(registryId: string): string {
  const [org, repo] = registryId.split("/");
  return path.join(skillCacheDir(), org, repo);
}

export function hasCachedClone(registryId: string): boolean {
  return fs.existsSync(path.join(registryCacheDir(registryId), ".git"));
}

/** Makes the registry available on disk and returns its root (the dir containing `skills/`). */
export async function prepareRegistry(registryId: string, source: RegistrySource): Promise<string> {
  switch (source.kind) {
    case "local":
      return source.path;
    case "bundled": {
      // Installed symlinks must not point into an npx temp dir or a reinstallable node_modules.
      const dir = registryCacheDir(registryId);
      await fs.remove(path.join(dir, "skills"));
      await fs.copy(path.join(source.path, "skills"), path.join(dir, "skills"));
      return dir;
    }
    case "git": {
      const dir = registryCacheDir(registryId);
      if (hasCachedClone(registryId)) {
        await pullShallow(dir);
      } else {
        await fs.remove(dir);
        await fs.ensureDir(path.dirname(dir));
        await sparseClone(source.url, dir, "skills");
      }
      return dir;
    }
  }
}

export async function registryHead(source: RegistrySource, root: string): Promise<string | undefined> {
  return source.kind === "git" ? headOf(root) : undefined;
}
