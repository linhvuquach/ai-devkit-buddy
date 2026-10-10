import path from "path";
import pc from "picocolors";
import type { RegistryAddStatus, RegistryRemoveStatus } from "../../lib/config";
import type { InstallReport } from "../../services/install/install.service";
import type { GlobalSkill, ProjectSkillStatus } from "../../services/skill/installer/installer.service";
import type { UpdateStatus, UpdateSummaryItem } from "../../services/skill/skill.service";
import type { SkillEntry, SkillInstallAction, SkillInstallResult } from "../../types";
import { isInside } from "../../util/fs";
import { ui } from "../../util/terminal-ui";

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

export function renderProjectSkills(skills: readonly ProjectSkillStatus[]): void {
  if (!skills.length) {
    ui.info("No skills installed in this project.");
    return;
  }
  for (const skill of skills) {
    const targets = skill.targets
      .map(({ environment, state }) => `${environment}:${state === "missing" ? pc.red(state) : state}`)
      .join(" ");
    ui.info(`${pc.bold(skill.name)} ${pc.dim(`(${skill.registry}, ${skill.mode})`)} ${targets}`);
  }
}

export function renderGlobalSkills(skills: readonly GlobalSkill[]): void {
  if (!skills.length) {
    ui.info("No global skills installed.");
    return;
  }
  for (const skill of skills) ui.info(`${pc.bold(skill.name)} ${pc.dim(`[${skill.environment}]`)} ${skill.path}`);
}

export function renderSearchResults(results: readonly SkillEntry[], keyword: string): void {
  if (!results.length) {
    ui.info(`No skills match "${keyword}".`);
    return;
  }
  for (const skill of results) {
    ui.info(`${pc.bold(skill.name)} ${pc.dim(skill.registry)}`);
    ui.info(`  ${skill.description}`);
  }
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
