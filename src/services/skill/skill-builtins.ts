import { TEMPLATES_ROOT } from "../../constants";
import type { DiscoveredSkill } from "../../types";
import { discoverRegistrySkills } from "./registry/registry-discovery";

/** Built-ins are whatever the bundled registry contains; there is no separate manifest. */
export function getBuiltinSkills(): Promise<DiscoveredSkill[]> {
  return discoverRegistrySkills(TEMPLATES_ROOT);
}
