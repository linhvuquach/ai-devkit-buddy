import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function git(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    maxBuffer: 16 * 1024 * 1024,
  });
  return stdout.trim();
}

export async function sparseClone(url: string, dir: string, sparsePath: string): Promise<void> {
  await git(["clone", "--depth", "1", "--filter=blob:none", "--sparse", url, dir]);
  await git(["-C", dir, "sparse-checkout", "set", sparsePath]);
}

export async function pullShallow(dir: string): Promise<void> {
  await git(["-C", dir, "fetch", "--depth", "1", "origin", "HEAD"]);
  await git(["-C", dir, "reset", "--hard", "FETCH_HEAD"]);
}

export function headOf(dir: string): Promise<string> {
  return git(["-C", dir, "rev-parse", "HEAD"]);
}
