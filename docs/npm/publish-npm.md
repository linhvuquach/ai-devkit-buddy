## Publish NPM

- Update package.json file

```json
"files": [
    "dist",
    "bin",
    "src/templates"
  ],
```

- Run `npm login` to login to npm
- Run `npm publish --access public` to publish the package

## Automated Publishing (GitHub Actions)

Create a workflow `.github/workflows/publish.yml` that automatically publishes to npm when you create a GitHub Release.

### Setup

1. Go to your GitHub repository settings.
2. Navigate to Secrets and variables > Actions.
3. Create a new repository secret named NPM_TOKEN.
4. Paste your npm automation token (generate one on npmjs.com).

### Usage

1. Update version in package.json.
2. Commit and push changes.
3. Create a new Release on GitHub (e.g., v0.1.1).

The Action will build, test, and publish the package.

## Automatically generated release notes and publish to npm

### Usage (Release Flow)

- Update Version: Bump version in package.json (e.g., 2.0.0).
- Update Changelog: Add a new entry in CHANGELOG.md for [2.0.0].
- Commit: git commit -am "chore: release v2.0.0"
- Tag & Push:

```bash
git tag v2.0.0
git push origin v2.0.0
```

#### Result:

- GitHub Action triggers.
- Extracts notes from CHANGELOG.md.
- Creates a GitHub Release v2.0.0 with the notes.
- Publishes ai-devkit-buddy@2.0.0 to NPM.

#### Resources

- https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes
- https://arbitrary-but-fixed.net/devops/shell/2021/02/19/release-notes-from-changelog.html

## Troubleshooting

### Publish npm auto-corrected some errors in your package.json when publishing

- Run "npm pkg fix" to address these errors.
