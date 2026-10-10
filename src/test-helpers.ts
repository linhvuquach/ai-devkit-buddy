import { execFileSync } from "child_process";
import fs from "fs-extra";
import os from "os";
import path from "path";

export interface Sandbox {
  root: string;
  /** AI_DEVKIT_BUDDY_HOME */
  home: string;
  /** HOME, the target of global installs */
  userHome: string;
  project: string;
}

/** Fresh temp dirs wired into AI_DEVKIT_BUDDY_HOME and HOME, with an empty official registry list. */
export async function createSandbox(): Promise<Sandbox> {
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), "adb-test-")));
  const sandbox = {
    root,
    home: path.join(root, "adb-home"),
    userHome: path.join(root, "user-home"),
    project: path.join(root, "project"),
  };
  await Promise.all([sandbox.home, sandbox.userHome, sandbox.project].map((dir) => fs.ensureDir(dir)));
  const official = path.join(root, "official-registries.json");
  await fs.writeJson(official, { registries: {} });
  process.env.AI_DEVKIT_BUDDY_HOME = sandbox.home;
  process.env.AI_DEVKIT_BUDDY_OFFICIAL_REGISTRIES = official;
  process.env.HOME = sandbox.userHome;
  delete process.env.AI_DEVKIT_BUDDY_INDEX_TTL_MS;
  return sandbox;
}

export function skillMarkdown(name: string, description: string): string {
  return `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n`;
}

export async function writeSkill(registryRoot: string, name: string, description = `${name} skill. Use when testing.`) {
  const dir = path.join(registryRoot, "skills", name);
  await fs.outputFile(path.join(dir, "SKILL.md"), skillMarkdown(name, description));
  return dir;
}

export function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", ["-c", "user.name=test", "-c", "user.email=test@example.com", ...args], {
    cwd,
    encoding: "utf8",
  }).trim();
}

export async function createGitRegistry(dir: string, skills: string[]): Promise<string> {
  await fs.ensureDir(dir);
  git(dir, "init", "-q", "-b", "main");
  for (const name of skills) await writeSkill(dir, name);
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "init");
  return dir;
}

export function commitSkill(dir: string, name: string, description?: string): Promise<void> {
  return writeSkill(dir, name, description).then(() => {
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", `add ${name}`);
  });
}
