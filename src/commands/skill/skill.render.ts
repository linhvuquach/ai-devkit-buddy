import path from "path";
import pc from "picocolors";
import type { RegistryAddStatus, RegistryRemoveStatus } from "../../lib/config";
import type { InstallReport } from "../../services/install/install.service";
import type { GlobalSkill, InstalledSkill } from "../../services/skill/installer/installer.service";
import type { UpdateStatus, UpdateSummaryItem } from "../../services/skill/skill.service";
import { CLI_NAME } from "../../constants";
import type { DiscoveredSkill, SkillEntry, SkillInstallAction, SkillInstallResult } from "../../types";
import { isInside } from "../../util/fs";
import { ui } from "../../util/terminal-ui";
import { truncate } from "../../util/text";

const ACTION_STYLE: Record<SkillInstallAction, (text: string) => string> = {
  symlinked: pc.green,
  copied: pc.green,
  skipped: pc.dim,
  conflict: pc.red,
};

const UPDATE_STYLE: Record<UpdateStatus, (text: string) => string> = {
  updated: pc.green,
  unchanged: pc.dim,
  skipped: pc.dim,
  failed: pc.red,
};

function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function groupGlobalSkills(skills: readonly GlobalSkill[]): { name: string; environments: string; path: string }[] {
  const byName = new Map<string, { environments: string[]; paths: string[] }>();
  for (const skill of skills) {
    const existing = byName.get(skill.name);
    if (!existing) {
      byName.set(skill.name, { environments: [skill.environment], paths: [skill.path] });
      continue;
    }
    if (!existing.environments.includes(skill.environment)) existing.environments.push(skill.environment);
    if (!existing.paths.includes(skill.path)) existing.paths.push(skill.path);
  }
  return [...byName.entries()]
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([name, row]) => ({
      name,
      environments: row.environments.join(", "),
      path: row.paths.join(", "),
    }));
}

function displayPath(target: string): string {
  const cwd = process.cwd();
  return isInside(cwd, target) ? path.relative(cwd, target) : target;
}

export function renderInstallResults(results: readonly SkillInstallResult[]): void {
  for (const { registry, name, target, action } of results) {
    ui.info(`${ACTION_STYLE[action](action.padEnd(9))} ${registry}/${name} ${pc.dim("->")} ${displayPath(target)}`);
  }
  const conflicts = results.filter((result) => result.action === "conflict");
  if (conflicts.length) {
    ui.warn(`${conflicts.length} conflict(s): an existing symlink blocks a copy install. Re-run with --overwrite.`);
  }
}

export function renderInstallReport(report: InstallReport): void {
  renderInstallResults(report.results);
  for (const { registry, names, error } of report.failures) {
    ui.error(`failed    ${registry}: ${names.join(", ")}: ${error}`);
  }
}

export function renderCommandCopies(copies: readonly { name: string; target: string; copied: boolean }[]): void {
  for (const { name, target, copied } of copies) {
    const action = copied ? pc.green("copied".padEnd(9)) : pc.dim("skipped".padEnd(9));
    ui.info(`${action} command ${name} ${pc.dim("->")} ${displayPath(target)}`);
  }
}

export function renderProjectSkills(skills: readonly InstalledSkill[]): void {
  if (!skills.length) {
    ui.warn("No skills installed in this project.");
    ui.info(`Install a skill with: ${CLI_NAME} skill add <registry> <name>`);
    return;
  }

  ui.text("Installed Skills:", { breakline: true });
  ui.table({
    headers: ["Skill Name", "Registry", "Environments"],
    rows: skills.map((skill) => [skill.name, skill.registry, skill.environments.join(", ")]),
    columnStyles: [pc.cyan, pc.dim, pc.green],
  });
  ui.text(`Total: ${formatCount(skills.length, "skill")}`, { breakline: true });
}

export function renderGlobalSkills(skills: readonly GlobalSkill[]): void {
  if (!skills.length) {
    ui.info("No global skills installed.");
    ui.info(`Install a global skill with: ${CLI_NAME} skill add <registry> <name> --global`);
    return;
  }

  const grouped = groupGlobalSkills(skills);
  ui.text("Globally Installed Skills:", { breakline: true });
  ui.table({
    headers: ["Skill Name", "Environments", "Path"],
    rows: grouped.map((skill) => [skill.name, skill.environments, skill.path]),
    columnStyles: [pc.cyan, pc.green, pc.dim],
  });
  ui.text(`Total: ${formatCount(grouped.length, "skill installation")}`, { breakline: true });
}

export function renderSearchResults(results: readonly SkillEntry[], keyword: string, limit?: number): void {
  if (!results.length) {
    ui.warn(`No skills found matching "${keyword}"`);
    ui.info("Try a different keyword or use --refresh to update the skill index");
    return;
  }

  const shown = limit === undefined ? results : results.slice(0, limit);
  const hidden = results.length - shown.length;
  const showing = hidden > 0 ? ` (showing top ${shown.length})` : "";

  ui.text(`Found ${formatCount(results.length, "skill")} matching "${keyword}"${showing}:`, { breakline: true });
  ui.table({
    headers: ["Skill Name", "Registry", "Description"],
    rows: shown.map((skill) => [skill.name, skill.registry, truncate(skill.description, 60, "...")]),
    columnStyles: [pc.cyan, pc.dim, pc.white],
  });
  ui.text("\nInstall with:");
  for (const skill of shown) {
    ui.text(`  ${CLI_NAME} skill add ${skill.registry} ${skill.name}`);
  }
  if (hidden > 0) {
    ui.text(`\n${hidden} more. Narrow the keyword, or use --limit <n> or --all to see them.`);
  }
}

export function renderRegistrySkills(registry: string, skills: readonly DiscoveredSkill[]): void {
  if (!skills.length) {
    ui.info(`Registry ${registry} has no installable skills.`);
    return;
  }
  for (const skill of skills) {
    ui.info(pc.bold(skill.name));
    ui.info(`  ${skill.description}`);
  }
  ui.info(pc.dim(`${skills.length} skill(s) in ${registry}. Install with: ${CLI_NAME} skill add ${registry} <skill-name>`));
}

export function renderUpdateSummary(items: readonly UpdateSummaryItem[]): void {
  if (!items.length) {
    ui.info("No cached registries to update.");
    return;
  }
  for (const { registry, status, error } of items) {
    ui.info(`${UPDATE_STYLE[status](status.padEnd(9))} ${registry}${error ? ` ${pc.dim(error)}` : ""}`);
  }
}

export function renderRegistryStatus(id: string, status: RegistryAddStatus | RegistryRemoveStatus): void {
  ui.info(`${status === "not-registered" ? pc.yellow(status) : pc.green(status)} ${id}`);
}
