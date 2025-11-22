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
