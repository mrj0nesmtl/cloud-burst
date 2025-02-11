# Project Structure Documentation

This directory contains automatically generated documentation of the project's directory structure.

## Available Structure Documents

- [Full Project Tree](./FULL_TREE.md) - Complete project structure
- [Source Code Tree](./SRC_TREE.md) - Structure of the `src` directory
- [Documentation Tree](./DOCS_TREE.md) - Structure of the `docs` directory
- [GitHub Configuration Tree](./GITHUB_TREE.md) - Structure of GitHub-related configurations

## Updating the Documentation

To update these structure documents, run:

```bash
npm run generate:structure
```

This will regenerate all structure documentation files with the current project state.

## Structure Generation Rules

- Full Tree: Max depth of 4 levels, excludes build artifacts and dependencies
- Source Tree: Max depth of 5 levels, focuses on application code
- Docs Tree: Max depth of 3 levels, shows documentation organization
- GitHub Tree: Max depth of 3 levels, shows GitHub-specific files

Last Updated: 2025-02-11T20:09:41.404Z
