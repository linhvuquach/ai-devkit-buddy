import fs from "fs-extra";
import path from "path";
import pc from "picocolors";

export interface TrackerConfig {
  version: string;
  environment: "cursor" | "claude" | "both";
  initializedTypes: string[];
  createdAt: string;
  updatedAt: string;
}

const TRACKER_FILE = ".ai-devkit-buddy.json";

export async function getTrackerConfig(): Promise<TrackerConfig | null> {
  const cwd = process.cwd();
  const trackerPath = path.join(cwd, TRACKER_FILE);

  if (fs.existsSync(trackerPath)) {
    try {
      return await fs.readJson(trackerPath);
    } catch (error) {
      console.error(pc.red("Failed to read tracker config:"), error);
      return null;
    }
  }
  return null;
}

export async function updateTrackerConfig(
  config: Partial<TrackerConfig>
): Promise<void> {
  const cwd = process.cwd();
  const trackerPath = path.join(cwd, TRACKER_FILE);
  const currentConfig = (await getTrackerConfig()) || {
    version: "0.0.1",
    createdAt: new Date().toISOString(),
    initializedTypes: [],
  };

  const newConfig = {
    ...currentConfig,
    ...config,
    updatedAt: new Date().toISOString(),
    // Merge initializedTypes if they exist
    initializedTypes: Array.from(
      new Set([
        ...(currentConfig.initializedTypes || []),
        ...(config.initializedTypes || []),
      ])
    ),
  };

  try {
    await fs.writeJson(trackerPath, newConfig, { spaces: 2 });
    console.log(pc.dim("Updated .ai-devkit-buddy.json"));
  } catch (error) {
    console.error(pc.red("Failed to update tracker config:"), error);
  }
}
