# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Refactor
- Category prompt template, and then start `init` by picking category. (E.g. `-e cursor -t requirements,design` to generate requirements and design commands for cursor environment.)

### Fixed

- Fix can't init multiple types. E.g. `-e cursor -t capture-knowledge, onboarding` should generate these types for cursor environment.

### Added

- Review prompt template that review specific logic of code.
- Check security-auditor template that check security of code.
- Check performance prompt template that check performance of code.
- Add generate `Skills` feature.

### [2.1.7] - 2026-03-31

### Added

- Add `mastering-node.js` command that help to master Node.js concepts using the 80/20 rule + Feynman technique.

### [2.1.6] - 2026-03-16

### Added

- Add `elite-javascript` command that help to generate JavaScript code with expert level.
- Add `elite-csharp` command that help to generate C# code with expert level.
- Add `senior-csharp-tech-lead-interviewer` command that help to generate senior C# tech lead interviewer.
- Add `senior-frontend-tech-lead-interviewer` command that help to generate senior frontend tech lead interviewer.
- Add `senior-database-lead-interviewer` command that help to generate senior database lead interviewer.

### Changed

- Rename `system-design-for-specific-requirement` command to `compose-system-design`.
- Rename `technical-approach-for-specific-requirement` command to `compose-technical-approach`.

## [2.1.5] - 2026-02-06

### Added

- Add `technical-approach-for-specific-requirement` command that help to generate technical approach for specific requirement.
- Add `system-design-for-specific-requirement` command that help to generate system design for specific requirement.

## [2.1.4] - 2025-12-10

### Added

- Add `csharp-expert` command that help to generate C# code with expert level.
- Add `code-review` command that help to review entire codebase code.

## [2.1.2] - 2025-12-03

### Added

- Add `init-specific-prompt` command that help to generate specific prompt template.
- Add `ado-fix-issue` command that help to fix issue on Azure DevOps (using Azure Devops MCP server).

### Changed

- Rename slash command `ado-refine-new-us` to `ado-refine-new-us`.

### Fixed

- Fix npm vulnerabilities in dependencies.

## [2.1.1] - 2025-12-03

### Added

- Add `onboarding` command that help to generate onboarding document of project.
- Add `capture-knowledge` command that help to capture knowledge of code.

### Changed

- Revise the `ado-refine-new-us` prompt template to check whether the AI assistant has already connected to the Azure DevOps MCP server.

## [2.0.0] - 2025-11-24

### Added

- Add ado-refine-new-us prompt template that help to refine new US on Azure DevOps (using Azure Devops MCP server)

### Changed

- Revise structure of templates.

## [1.0.0] - 2025-11-21

### Added

- Add init command to initialize ai-devkit-buddy in the current project.
