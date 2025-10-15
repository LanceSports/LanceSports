# Codecov Setup Instructions for LanceSports

This guide will help you set up Codecov for your LanceSports project to get a nice coverage badge on GitHub.

## Step-by-Step Instructions

### 1. Install Coverage Dependencies

First, install the coverage provider for Vitest:

```bash
npm install --save-dev @vitest/coverage-v8
```

### 2. GitHub Setup

#### 2.1 Go to Codecov.io
1. Visit [codecov.io](https://codecov.io)
2. Sign in with your GitHub account
3. Click "Add new repository"
4. Find and select your `LanceSports` repository
5. Copy the repository token (you'll need this for GitHub Secrets)

#### 2.2 Set up GitHub Secrets
1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Name: `CODECOV_TOKEN`
6. Value: Paste the token you copied from Codecov.io
7. Click "Add secret"

### 3. Update Your README.md

Add the Codecov badge to your README.md file. Since your repository is at `https://github.com/LanceSports/LanceSports/`, use this exact badge:

```markdown
[![codecov](https://codecov.io/gh/LanceSports/LanceSports/branch/main/graph/badge.svg)](https://codecov.io/gh/LanceSports/LanceSports/)
```

### 4. Test the Setup

#### 4.1 Run Tests Locally
```bash
npm run test:coverage
```

This should generate a coverage report in the `coverage/` directory.

#### 4.2 Push to GitHub
1. Commit and push your changes:
```bash
git add .
git commit -m "Add Codecov configuration and tests"
git push origin main
```

2. Go to your GitHub repository's "Actions" tab
3. You should see the "Test Coverage" workflow running
4. Once completed, go back to Codecov.io and refresh your repository page
5. You should see coverage data and the badge should appear

### 5. Verify the Badge

1. Go to your repository's main page on GitHub
2. You should see the Codecov badge in your README
3. Click on the badge to see detailed coverage information

## Configuration Details

### Coverage Thresholds
The configuration is set to:
- **Target coverage**: 80% for the project
- **Patch coverage**: 70% for pull requests
- **Threshold**: 5% (coverage can drop by 5% before failing)

### Files Covered
The configuration includes:
- All TypeScript/TSX files in `src/`
- Excludes test files, config files, and build artifacts
- Focuses on actual application code

### GitHub Actions Workflow
The workflow:
- Runs on pushes to `main` and `develop` branches
- Runs on pull requests targeting `main` and `develop`
- Tests on Node.js 18.x and 20.x
- Uploads coverage data to Codecov
- Provides detailed coverage reports

## Troubleshooting

### Badge Not Showing
1. Make sure you've added the `CODECOV_TOKEN` secret to your repository
2. Check that the GitHub Action workflow is running successfully
3. Verify the repository is connected in Codecov.io
4. Wait a few minutes for the badge to appear after the first successful run

### Coverage Too Low
1. Run tests locally: `npm run test:coverage`
2. Check which files have low coverage
3. Add more tests for uncovered code
4. The current threshold is set to 70% - you can adjust this in `vitest.config.ts`

### Workflow Fails
1. Check the GitHub Actions logs for specific error messages
2. Ensure all dependencies are installed correctly
3. Verify the `CODECOV_TOKEN` secret is set correctly
4. Make sure the repository has the necessary permissions

## Customization

### Adjust Coverage Thresholds
Edit `vitest.config.ts` to change the coverage requirements:

```typescript
thresholds: {
  global: {
    branches: 80,    // Increase from 70
    functions: 80,   // Increase from 70
    lines: 80,       // Increase from 70
    statements: 80   // Increase from 70
  }
}
```

### Change Badge Style
You can customize the badge appearance by modifying the URL parameters:

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO_NAME/branch/main/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO_NAME)
```

## Support

If you encounter any issues:
1. Check the [Codecov documentation](https://docs.codecov.com/)
2. Review the GitHub Actions logs
3. Ensure all configuration files are properly set up
4. Verify your repository permissions and secrets

The setup is now complete! Your LanceSports project will automatically track test coverage and display a professional badge on GitHub.
