# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Fix can't init multiple types. E.g. `-e cursor -t capture-knowledge, onboarding` should generate these types for cursor environment.

### Added

- Review prompt template that review specific logic of code.
- Check security-auditor template that check security of code.
- Check performance prompt template that check performance of code.

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
