# Version Control Guidelines

## Semantic Versioning
Cloud Burst follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** version (X.0.0) - incompatible API changes
- **MINOR** version (0.X.0) - backwards-compatible functionality
- **PATCH** version (0.0.X) - backwards-compatible bug fixes

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Development integration branch
- `staging` - Pre-production testing

### Feature Branches
Format: `feature/CC-{issue-number}-{brief-description}`
Example: `feature/CC-123-photo-upload`

### Bug Fix Branches
Format: `fix/CC-{issue-number}-{brief-description}`
Example: `fix/CC-456-auth-token`

### Release Branches
Format: `release/v{major}.{minor}.{patch}`
Example: `release/v1.2.0`

## Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Scopes
- `core`: Core functionality
- `auth`: Authentication
- `ui`: User interface
- `api`: API changes
- `db`: Database
- `ai`: AI/ML features
- `docs`: Documentation
- `test`: Testing
- `deps`: Dependencies

### Examples
```
feat(photo): add AI-powered image enhancement

- Implemented TensorFlow.js for real-time processing
- Added quality adjustment controls
- Integrated with existing upload flow

Closes #123
```

### Recent Commit Examples
```
feat(ui): integrate Shadcn UI component library

- Initialized Shadcn UI with project defaults
- Added essential UI components
- Set up component directory structure
- Configured Tailwind for Shadcn

Closes #<issue-number>
```

## Release Process

1. **Version Bump**
   ```bash
   npm version <major|minor|patch>
   ```

2. **Update Changelog**
   - Move "Unreleased" changes to new version
   - Add release date
   - Update version links

3. **Create Release Branch**
   ```bash
   git checkout -b release/v1.2.0
   ```

4. **Release Checklist**
   - [ ] Version bumped
   - [ ] Changelog updated
   - [ ] Tests passing
   - [ ] Documentation updated
   - [ ] Dependencies updated
   - [ ] Performance verified
   - [ ] Security checked

5. **Merge Process**
   ```bash
   git checkout main
   git merge --no-ff release/v1.2.0
   git tag -a v1.2.0 -m "Version 1.2.0"
   git push origin main --tags
   ```

## Git Hooks
Pre-commit hooks enforce:
- Code formatting
- Lint checks
- Type checking
- Test execution
- Commit message format

## CI/CD Integration
- GitHub Actions runs on every push
- Automated version bumping
- Changelog verification
- Release automation 