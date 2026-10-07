# Architecture & Build Plan: A Skill Package Manager (`<CLI_NAME>`)

Goal: build our own package that authors, distributes, searches and installs Agent Skills
(`SKILL.md` folders) into AI coding agents (launch scope: Claude Code, Cursor, OpenAI Codex), replicating the architecture of the
reference solution reviewed in `packages/cli/src` + `/skills`.

Naming (all are USER-SUPPLIED values; nothing is hardcoded in this plan - see §0):

| Thing            | Placeholder                         |
|------------------|-------------------------------------|
| npm package/CLI  | `<CLI_NAME>`                        |
| Project config   | `<CONFIG_FILE>`                   |
| Global home/cache| `~/<HOME_DIR>/` (`skills-cache/`, `skill-index.json`, `config.json`) |
| First-party registry id | `<REGISTRY_ORG>/<REGISTRY_REPO>` (the "built-in" registry) |
| Env vars         | `<ENV_PREFIX>_*`                       |

> Provenance: everything below is derived from reading the reference source
> (`commands/skill/skill.command.ts`, `cli.ts`, `commands/init.ts`, `commands/install.ts`,
> `lib/GlobalConfig.ts`, `services/skill/**`). Scope note: the reference CLI also manages
> phases/docs, MCP servers, plugins, agents and channels; those are out of scope here. This
> package covers only skills + the agent-environment table.


## 0. Required inputs (ask the user before Phase 0; never invent defaults)

| Token | Meaning | Example shape |
|---|---|---|
| `<CLI_NAME>` | npm package + binary name | lowercase, kebab-case |
| `<CONFIG_FILE>` | per-project config filename | dotfile, `.json` |
| `<HOME_DIR>` | global dir under `~` for cache/index/global config | dotfolder |
| `<ENV_PREFIX>` | env-var prefix for overrides | UPPER_SNAKE |
| `<REGISTRY_ORG>/<REGISTRY_REPO>` | id of the first-party (built-in) registry | `org/repo` |
| `<repo-name>` | new repository name | any |

All tokens are defined once in `src/constants.ts` and read from there everywhere (code,
errors, docs, SKILL.md description prefix, `agents/*.yaml`).


---

## 1. Core idea (one paragraph)

A **skill** is a folder with a `SKILL.md`. A **registry** is any git repo (or local dir)
containing `skills/<name>/SKILL.md`. A **built-in set** is just a curated list of names
inside the first-party registry - not a separate mechanism. A **CLI** merges registry
sources (official list + user config), caches them locally, builds a searchable **index**,
and **installs** skills into each AI agent's skill directory (symlink by default, copy
optional), recording the result in a project config so installs are reproducible.

```
 authors ──push──▶  Registry repos (git / file://)           Official list
                         skills/<name>/SKILL.md              registry.json (id → git url)
                                │                                    │
                                ▼                                    ▼
                    ┌──────────────────────── CLI ────────────────────────┐
                    │ commands/  (thin: parse flags, call service, render) │
                    │ services/skill/                                      │
                    │   SkillService (facade)                              │
                    │     ├─ RegistryService  (merge, clone/pull, update)  │
                    │     ├─ IndexService     (build, TTL cache, search)   │
                    │     └─ InstallerService (resolve, link/copy, remove) │
                    │ lib/   ConfigManager (project) · GlobalConfigManager │
                    │ util/  env table · git · github · errors · ui        │
                    └──────────────┬───────────────────────────────────────┘
                                   ▼
        ~/<HOME_DIR>/skills-cache/<org>/<repo>/   (cloned registries)
                                   ▼  symlink (default) | copy
   <project>/.claude/skills/<name>   .cursor/skills/<name>   .agents/skills/<name> (codex)
   ~/.claude/skills/<name>  (global installs)
```

---

## 2. Repository layout (monorepo, npm workspaces)

```
<repo-name>/
├─ package.json                 # workspaces: ["packages/*"]
├─ skills/                      # FIRST-PARTY REGISTRY (itself a registry)
│  ├─ <skill-name>/
│  │   ├─ SKILL.md              # required
│  │   ├─ agents/openai.yaml    # optional per-agent UI metadata
│  │   ├─ scripts/              # optional helper scripts
│  │   └─ references/           # optional long docs loaded on demand
│  ├─ built-in.json             # curated default set: ["skill-a", ...]
│  ├─ registry.json             # official registry list: { "registries": { id: gitUrl } }
│  └─ index.json                # generated search index (CI-owned, never hand-edited)
├─ packages/
│  └─ cli/
│     ├─ package.json           # bin: <CLI_NAME>
│     └─ src/
│        ├─ cli.ts / index.ts   # commander wiring only
│        ├─ commands/
│        │   ├─ init.ts  install.ts
│        │   └─ skill/ skill.command.ts  skill.render.ts  index.ts
│        ├─ services/
│        │   ├─ skill/
│        │   │   ├─ skill.service.ts            # facade
│        │   │   ├─ skill.types.ts
│        │   │   ├─ skill-validation.ts
│        │   │   ├─ skill-description.ts
│        │   │   ├─ skill-builtins.ts
│        │   │   ├─ registry/ skill-registry.service.ts
│        │   │   │            skill-registry-source.ts
│        │   │   │            registry-skill-discovery.ts
│        │   │   ├─ index/    skill-index.service.ts
│        │   │   │            skill-index.repository.ts
│        │   │   └─ installer/ skill-installer.service.ts
│        │   └─ install/ install.service.ts     # reproduce project from config
│        ├─ lib/  Config.ts  GlobalConfig.ts
│        ├─ util/ env.ts git.ts github.ts errors.ts terminal-ui.ts text.ts config.ts
│        ├─ types.ts
│        └─ __tests__/ (mirrors src tree)
├─ scripts/                     # validate-skills, rebuild-index wrappers
├─ docs/                        # authoring guide, registry guide, architecture
└─ .github/workflows/           # ci.yml, index.yml, release.yml
```

Why this shape (maintainability): one folder per concern, commands never contain logic,
services are individually unit-testable, and the content (`skills/`) is decoupled from
the code (`packages/`) so skills can be released without a CLI release.

---

## 3. Domain model

```ts
// types.ts
type EnvironmentCode = "claude" | "cursor" | "codex";   // launch scope; extend by adding a union member + table entry
type SkillInstallMode = "link" | "copy";               // default "link"

interface EnvironmentDefinition {
  code: EnvironmentCode;
  name: string;
  skillPath?: string;        // project-relative, e.g. ".claude/skills"
  globalSkillPath?: string;  // home-relative,   e.g. ".claude/skills"
  // optional: mcp config location etc. (extension point, see §9)
}

interface ProjectConfig {                       // <CONFIG_FILE>
  environments: EnvironmentCode[];
  skills: { registry: string; name: string; mode?: SkillInstallMode }[];
  registries?: Record<string, string>;          // project-scoped extra registries
}

interface SkillEntry { name; registry; path; description; lastIndexed }  // index row
interface SkillIndexData { meta:{version,createdAt,updatedAt,registryHeads:Record<string,string>}; skills: SkillEntry[] }

type SkillInstallAction = "symlinked" | "copied" | "skipped" | "conflict";
```

Registry id format: `org/repo` (regex `^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$`; reject `..`, `~`).

---

## 4. Component specs

### 4.1 Skill format & authoring contract
- Folder name == skill name: `^[a-z0-9]+(-[a-z0-9]+)*$` (no leading/trailing/double hyphen).
- `SKILL.md` = YAML frontmatter (`name`, `description`) + markdown body.
- `description` = what it does **+ "Use when ..."** trigger phrases (this is what agents
  match on and what search indexes). Optional brand prefix convention is allowed.
- Body: imperative steps / contract -> guardrails -> output conventions. Keep < 1 MB
  (hard limit enforced by discovery). Long material goes in `references/`.
- Optional `agents/openai.yaml` (`display_name`, `short_description`, `default_prompt`).
- Optional `scripts/` must be self-contained and documented in SKILL.md.

### 4.2 `skill-validation.ts`
- `validateRegistryId`, `validateSkillName` (throws `ValidationError`), `isValidSkillName`
  (boolean). Single source of truth, used by installer, discovery, builtins, CI lint.

### 4.3 `skill-description.ts`
- `extractSkillDescription(content)`: `gray-matter` -> `data.description`; fallback first
  non-heading line; fallback `"No description available"`. Never throws.

### 4.4 Registry layer (`registry/`)
- **skill-registry-source.ts** - parse sources: git URL, `file:///abs`, absolute path,
  `./relative` (normalized against config dir, `realpath`'d, must be a directory).
- **skill-registry.service.ts**
  - `fetchMergedRegistry()`: official `registry.json` (remote, with offline fallback) +
    global config registries + project config registries; later scope wins.
  - `prepareRegistryRepository(id, url)`: shallow clone into
    `SKILL_CACHE_DIR/<org>/<repo>` or `git pull`; local registries used in place.
  - `addRegistrySource` / `removeRegistrySource` (project or `--global`, `--force` to override).
  - `updateSkills(registryId?)` -> `UpdateSummary` (pull caches, report changed/failed).
- **registry-skill-discovery.ts**
  - `discoverRegistrySkills(id, root)`: enumerate `skills/*`, keep dirs/symlinks with valid
    name + `SKILL.md`, return `{name, description}` sorted.
  - `resolveContainedSkill(...)`: security boundary - `realpath` containment so symlinks
    cannot escape the registry; caps: 10,000 entries, 1 MB `SKILL.md`.

### 4.5 Index layer (`index/`)
- `SkillIndexRepository`: read / readRequired / write / exists / defaultPath
  (`~/<HOME_DIR>/skill-index.json`).
- `SkillIndexService`
  - `findSkills(keyword, {refresh})`: ensure index, then rank.
  - Ranking: exact name 0 -> prefix 1 -> contains 2 -> description contains 3; ties by
    name then registry. Plain substring, lowercase.
  - `ensureSkillIndex`: use cached if age < 24 h (TTL) and re-scan local registries;
    otherwise rebuild; cold start seeded from hosted `skills/index.json`.
  - `buildSkillIndex`: per registry record git HEAD (`registryHeads`) -> only re-scan
    registries whose HEAD changed (incremental). GitHub API path used when no clone.
  - `updateRegistryFromCache` / `removeRegistry`: keep index consistent when registries
    are added/removed.
  - `rebuildIndex(output?)`: CI entrypoint.

### 4.6 Installer (`installer/skill-installer.service.ts`)
- `addSkills(registryId, names[], {global, environments, mode, overwrite})`
  1. validate ids/names; prepare registry (clone or local);
  2. resolve environments (project config / `--env` / global requires `--env`);
  3. map env -> target dirs via env table (`skillPath` / `globalSkillPath`), dedupe shared
     dirs (no-op for the three launch agents - their paths differ - but keep it so adding an
     agent that shares a directory, e.g. another `.agents/skills` user, needs no installer change);
  4. per target: **exists -> skip**; copy requested over symlink -> `conflict` unless
     `--overwrite`; else `symlink` (fallback to copy if symlink fails) or `copy`
     (`dereference: true`);
  5. non-global installs upsert into `<CONFIG_FILE>` `skills[]`.
- `listSkills`, `listGlobalSkills(envCodes?)`, `removeSkill(name, {global, env})`
  (global removal asserts target stays inside configured root - path-traversal guard).
- `listInstallableSkills(registryId)` powers the interactive picker.

### 4.7 Config managers (`lib/`)
- `ConfigManager` (project): read/create/update, `addSkill` (idempotent upsert, mode
  update only when explicit), `removeSkill`, `get/add/removeSkillRegistry`.
- `GlobalConfigManager`: JSON file at `~/<HOME_DIR>/<CONFIG_FILE>`. Holds a
  `registries: Record<id, source>` map (other keys such as plugins/agent runtime are out of
  scope). Behavior: `read()` returns `null` if missing and warns + returns `null` if unparsable;
  `add/removeSkillRegistry` refuse to write when the file exists but is unreadable
  (`GLOBAL_CONFIG_UNREADABLE`), so a corrupt file is never clobbered; registry mutations are
  planned by pure functions `planSkillRegistryAdd/Remove` (statuses: `added`, `updated`,
  `already-registered`, `removed`, `not-registered`) shared with the project `ConfigManager`;
  local-path sources are normalized relative to the config file's directory; writes use
  `ensureDir` + `writeJson(spaces: 2)`.

### 4.8 Built-ins (`skill-builtins.ts`)
- `BUILTIN_SKILL_REGISTRY = "<REGISTRY_ORG>/<REGISTRY_REPO>"`.
- `getBuiltinSkillNames()`: fetch hosted `skills/built-in.json` -> validate (non-empty array,
  valid unique names) -> memoize promise; on any failure use compiled-in fallback array.
- Rule: the fallback array mirrors `built-in.json` and is kept in sync manually, as in the
  reference.

### 4.9 Env table (`util/env.ts`)
- Declarative array of `EnvironmentDefinition`; helpers `getSkillPath`, `getGlobalSkillPath`,
  `getSkillCapableEnvironments`, `getAllEnvironments`, `validateEnvironmentCodes`.
- **Launch scope is exactly three environments** (values copied from the reference table):

  | code | name | project `skillPath` | `globalSkillPath` (under `~`) |
  |---|---|---|---|
  | `claude` | Claude Code | `.claude/skills` | `.claude/skills` |
  | `cursor` | Cursor | `.cursor/skills` | `.cursor/skills` |
  | `codex` | OpenAI Codex | `.agents/skills` | `.codex/skills` |

  Note Codex differs between project (`.agents/skills`) and global (`.codex/skills`); keep both
  fields separate. The reference's per-env `mcpConfigPath` is dropped (MCP is out of scope).
  `validateEnvironmentCodes` must reject anything outside these three with a message listing
  the supported codes.
- **Adding a new agent = adding one array entry + one union member** (+ test). This is the main
  scalability lever; the three-agent limit is a data choice, not an architectural one.

### 4.10 Commands (`commands/skill/skill.command.ts`)
Thin handlers wrapped in `withErrorHandler`; rendering in `skill.render.ts`.

| Command | Purpose |
|---|---|
| `<CLI_NAME> init` | pick environments, write config, offer built-ins. Flags: `-e/--environment <csv>`, `-t/--template <path>` (.yaml/.yml/.json), `--built-in` (no prompt), `-y/--yes` (non-interactive; requires `-e` when no template), `--overwrite` (with `--yes`) |
| `<CLI_NAME> install [-c/--config <path>] [--overwrite]` | reconcile project from config (default `<CONFIG_FILE>`): environments + skills; exits non-zero on failure/conflict, prints an application report |
| `<CLI_NAME> skill add [registry] [name]` | install; no name -> interactive picker (TTY only) |
| `<CLI_NAME> skill add --built-in` | install curated set |
| flags: `-g/--global`, `-e/--env <env...>`, `--mode link\|copy` | |
| `<CLI_NAME> skill list [-g] [-e <env...>]` | installed project skills, or global skills with `-g`; `-e` requires `-g` |
| `<CLI_NAME> skill remove <name> [-g -e]` | uninstall |
| `<CLI_NAME> skill find <kw> [--refresh --limit n --all]` | search |
| `<CLI_NAME> skill update [registry-id]` | pull cached git registries; local registries are reported as `skipped` (live filesystem) |
| `<CLI_NAME> skill add-registry <id> <source> [-g] [-f]` | register a git URL or local folder (`file://`, absolute, `./relative`); `-g` writes global config, `-f` overwrites a conflicting source; reports registered / updated / already-registered |
| `<CLI_NAME> skill remove-registry <id> [-g]` | unregister; `-g` also deletes the cached clone; also removes its index entries |
| `<CLI_NAME> skill rebuild-index [--output]` | CI |

---

## 5. Key behaviors to replicate exactly

1. Built-in == registry (no special-casing in installer).
2. Symlink-by-default into a shared cache -> one `update` refreshes every project.
3. Never overwrite existing installed folders (may contain local edits).
4. Project config is the reproducibility contract; global installs are not recorded.
5. Every filesystem write path is validated (name regex, containment, root checks).
6. Network failures degrade gracefully (fallback built-in list, cached index/registry).
7. Non-interactive mode never prompts; it errors with the exact command to re-run.
8. Index is derived data: regenerable, CI-owned, TTL-cached, incremental via git HEAD.

---

## 6. Data flows

**Install:** CLI -> `SkillService.addSkill` -> `Installer.addSkills` -> `Registry.fetchMergedRegistry`
-> `prepareRegistryRepository` (clone/pull) -> `resolveContainedSkill` -> env table ->
symlink/copy -> `ConfigManager.addSkill`.

**Search:** `find` -> `Index.ensureSkillIndex` (cache hit? TTL? else rebuild via registries/HEAD
diff) -> `searchSkillIndex` rank -> `renderSkillSearchResults`.

**Publish a skill:** author PR into a registry repo -> CI lint (§8) -> merge -> index workflow
regenerates `skills/index.json` -> consumers get it on next TTL refresh or `--refresh`.

---

## 7. Tech stack

Node >= 20, TypeScript (ESM, `.js` import suffixes), `commander`, `fs-extra`, `gray-matter`,
`@inquirer/prompts` (or equivalent) for the picker, `ora`/`chalk` behind `terminal-ui.ts`,
`jest` or `vitest`, `simple-git` or child-process git behind `util/git.ts`.
Keep all third-party IO behind `util/*` so it can be mocked.

---

## 8. Quality, CI & release

**Tests** (mirror reference): validation, description extraction, discovery (incl. symlink
escape + size/entry caps), registry source parsing, registry merge/update, index
ranking/TTL/incremental, installer (link/copy/skip/conflict/global/remove traversal),
builtins (manifest invalid -> fallback), commands (flag wiring), integration install against a
temp fixture registry using `file://`.

**Skill lint script** (`scripts/validate-skills`): for each `skills/*`: valid name, has
`SKILL.md`, frontmatter has `name` equal to folder and non-empty `description` containing
"Use when", size < 1 MB, referenced scripts/files exist, `built-in.json` entries exist and are
unique.

**Workflows:** `ci.yml` (lint, typecheck, test, skill lint), `index.yml` (on `skills/**` change
-> `rebuild-index` -> commit `skills/index.json`), `release.yml` (changesets or release-please
-> npm publish).

**Versioning:** CLI semver independent of skills; skills versioned by git HEAD of registry.

---

## 9. Scalability & extension points

- **More agents (post-launch):** one env-table entry. Optionally add per-env capabilities (MCP config path,
  rules file) as extra optional fields instead of new code paths.
- **More skills:** unbounded - discovery is streaming (`opendir`) with entry cap; index is
  incremental by HEAD; search is in-memory linear (fine to ~10^5). If it outgrows that, swap
  `searchSkillIndex` for an inverted index/SQLite behind the same `findSkills` signature.
- **More registries:** purely data (`registry.json` / config); no code change.
- **Alternative sources** (npm tarball, OCI, S3): add a new parser in `skill-registry-source.ts`
  + a `prepare` strategy; installer stays unchanged because it only needs a local dir.
- **Hosted index/registry:** swap raw GitHub URLs for a CDN by changing two constants.

## 10. Maintainability rules

1. Commands = parse + render only; all logic in services; services depend on interfaces
   (constructor injection, as `SkillService` does).
2. One validation module; one env table; one errors module (`CliError`, `ValidationError`,
   `NotFoundError`, `ConfigNotFoundError` with codes).
3. Derived files (`index.json`) are generated, never edited; CI is the only writer.
4. Constants (URLs, TTL, caps, cache dir) live at top of their module and are env-overridable.
5. Tests mirror source tree; every security guard has a negative test.
6. Docs: `docs/authoring-skills.md`, `docs/registries.md`, `docs/architecture.md`.

---

## 11. Naming checklist (values come from §0, never hardcoded)

Centralize in `src/constants.ts`: `CLI_NAME`, `CONFIG_FILE`, `HOME_DIR`,
`ENV_PREFIX`, `BUILTIN_SKILL_REGISTRY`, `REGISTRY_URL`, `BUILTIN_URL`, `INDEX_URL`.
Also scrub: description prefixes in SKILL.md,
`agents/*.yaml` display strings, error messages (e.g. "Run: <cli> init"), README, package
metadata.

---

## 12. Phased build plan

| Phase | Deliverable | Exit criteria |
|---|---|---|
| 0 Scaffold | monorepo, TS, lint, test runner, CI skeleton, `constants.ts`, errors, ui util | `<CLI_NAME> --version` works; CI green |
| 1 Skill core | validation, description, types, env table + tests | unit tests for all three env entries (paths, global vs project, invalid code rejected) |
| 2 Registry | source parser, discovery (with security caps), registry service (clone/pull/merge), `registry.json` | can list skills from a `file://` fixture and a git repo |
| 3 Installer | link/copy/skip/conflict, global, remove, config manager | integration test installs into 2 envs, config updated, re-install is no-op |
| 4 Commands | `init`, `skill add/list/remove/update/registry`, `install`, renderers | e2e on temp project; non-TTY errors correct |
| 5 Index & search | repository, build (HEAD-incremental), TTL, ranking, `find`, `rebuild-index`, `index.json` | ranking tests; refresh works offline from cache |
| 6 Built-ins | `built-in.json`, fallback, `--built-in`, init prompt, sync test | manifest failure falls back |
| 7 First content | 3-5 real skills + lint script + authoring docs | lint green; install in a sample repo |
| 8 CI/CD | index workflow, release workflow | automated index commit; published package |
| 9 Hardening | symlink-escape tests, Windows symlink fallback, large registry perf, docs | checklist in §13 |

## 13. Acceptance checklist

- [ ] Install built-in set into a fresh repo for all three agents (claude, cursor, codex); symlinks resolve; config written.
- [ ] `install` on a clone of that repo reproduces identical skills.
- [ ] A skill from a third-party registry and from a local `file://` registry both install.
- [ ] `find` ranks exact > prefix > contains > description; `--refresh`, `--limit`, `--all` work.
- [ ] Malicious registry (symlink escaping `skills/`, huge SKILL.md, 10k+ entries) is rejected.
- [ ] Offline: built-in list + cached index + cached registries still function.
- [ ] Adding a new agent requires only an env-table entry and a test.

## 14. Open decisions for the new repo

1. Values for every §0 token.
2. Hosting: GitHub raw URLs vs CDN for `registry.json` / `built-in.json` / `index.json`.
3. ~~Agents at launch~~ decided: `claude`, `cursor`, `codex` only.
