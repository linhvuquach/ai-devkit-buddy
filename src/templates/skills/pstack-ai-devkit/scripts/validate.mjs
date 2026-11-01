#!/usr/bin/env node
/**
 * Structural checks for pstack-ai-devkit.
 * Run: node .cursor/skills/pstack-ai-devkit/scripts/validate.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(skillDir, "../../..");
const skillPath = path.join(skillDir, "SKILL.md");
const failures = [];

function fail(msg) {
  failures.push(msg);
}

const raw = fs.readFileSync(skillPath, "utf8");
const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
if (!fm) {
  fail("missing YAML frontmatter");
} else {
  const block = fm[1];
  if (!/^name:\s*pstack-ai-devkit\s*$/m.test(block)) {
    fail("frontmatter name must be pstack-ai-devkit");
  }
  if (!/^description:\s*/m.test(block)) {
    fail("frontmatter missing description");
  }
  if (/disable-model-invocation:\s*true/m.test(block)) {
    fail("disable-model-invocation must be absent so Feature can auto-load");
  }
  let desc = "";
  const lines = block.split("\n");
  const descIdx = lines.findIndex((line) => /^description:\s*/.test(line));
  if (descIdx >= 0) {
    const head = lines[descIdx].replace(/^description:\s*/, "");
    if (head === ">" || head === ">-") {
      const body = [];
      for (let i = descIdx + 1; i < lines.length; i++) {
        if (/^[A-Za-z][\w-]*:/.test(lines[i])) break;
        body.push(lines[i].replace(/^\s{2}/, ""));
      }
      desc = body.join(" ").replace(/\s+/g, " ").trim();
    } else {
      desc = head.trim();
    }
  }
  if (!desc) fail("description is empty");
  if (desc.length > 1024) fail(`description length ${desc.length} > 1024`);
  for (const term of [
    "poteto-mode",
    "Feature",
    "lifecycle docs",
    "task",
    "memory",
    "verify",
    "smoke",
    "AI DevKit",
  ]) {
    if (!desc.toLowerCase().includes(term.toLowerCase())) {
      fail(`description missing trigger term: ${term}`);
    }
  }
}

const requiredSkills = [
  "task/SKILL.md",
  "memory/SKILL.md",
  "verify/SKILL.md",
  "dev-smoke/SKILL.md",
  "dev-lifecycle/SKILL.md",
];
for (const rel of requiredSkills) {
  const p = path.join(root, ".cursor/skills", rel);
  if (!fs.existsSync(p)) fail(`missing referenced skill: .cursor/skills/${rel}`);
}

const ownershipLine =
  /poteto-mode stays the router; AI DevKit owns lifecycle docs, task CLI, memory, verify, and smoke/;
if (!ownershipLine.test(raw)) {
  fail("body missing verbatim ownership sentence");
}
if (!/Don't duplicate AI DevKit phases into pstack/i.test(raw)) {
  fail("body missing no-duplicate-phases rule");
}
if (!/\|\s*Need\s*\|\s*Owner\s*\|\s*Call\s*\|/.test(raw)) {
  fail("body missing ownership table");
}
if (!/\*\*Feature \(sample\)\.\*\*/.test(raw)) {
  fail("body missing Feature sample hooks");
}

if (failures.length) {
  console.error("FAIL");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log("OK");
console.log(`skill: ${skillPath}`);
console.log("feature-load: description has triggers; auto-invoke enabled");
