import fs from "fs";
import path from "path";

export async function lstatOrNull(target: string): Promise<fs.Stats | null> {
  try {
    return await fs.promises.lstat(target);
  } catch {
    return null;
  }
}

/** True when `child` is strictly inside `parent` (both already absolute). */
export function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}
