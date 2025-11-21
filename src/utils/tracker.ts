import fs from "fs-extra";
import path from "path";
import pc from "picocolors";

export interface TrackerConfig {
  version: string;
  environment: "cursor" | "claude" | "both";
  initializedPhases: string[];
  createdAt: string;
  updatedAt: string;
}

const CONFIG_FILE = ".ai-devkit-buddy.json";

export async function getTrackerConfig(): Promise<TrackerConfig | null> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, CONFIG_FILE);

  if (fs.existsSync(configPath)) {
    try {
      return await fs.readJson(configPath);
    } catch (error) {
      console.error(pc.red(`Failed to read ${CONFIG_FILE}`));
      return null;
    }
  }
  return null;
}

export async function updateTrackerConfig(config: Partial<TrackerConfig>) {
  const cwd = process.cwd();
  const configPath = path.join(cwd, CONFIG_FILE);

  let currentConfig = await getTrackerConfig();
  const now = new Date().toISOString();

  if (!currentConfig) {
    currentConfig = {
      version: "0.2.0",
      environment: config.environment || "cursor",
      initializedPhases: [],
      createdAt: now,
      updatedAt: now,
      ...config,
    };
  } else {
    currentConfig = {
      ...currentConfig,
      ...config,
      updatedAt: now,
      initializedPhases: [
        ...new Set([
          ...currentConfig.initializedPhases,
          ...(config.initializedPhases || []),
        ]),
      ],
    };
  }

  try {
    await fs.writeJson(configPath, currentConfig, { spaces: 2 });
    console.log(pc.gray(`Updated ${CONFIG_FILE}`));
  } catch (error) {
    console.error(pc.red(`Failed to write ${CONFIG_FILE}`));
  }
}
