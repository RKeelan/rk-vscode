# Plan: GitHub CI and Dependabot

## Summary

Add a GitHub Actions CI workflow for automated testing, linting, and building, plus Dependabot configuration for automated dependency updates. Also fix the existing lint script and add ESLint configuration.

## Tasks

### Task 1: Fix ESLint Configuration

**Description:**
The project has ESLint dependencies but no configuration file, and the lint script pattern doesn't match TypeScript files. Fix both issues.

**Changes:**
1. Create `.eslintrc.json`:
   ```json
   {
     "root": true,
     "parser": "@typescript-eslint/parser",
     "parserOptions": {
       "ecmaVersion": 2022,
       "sourceType": "module"
     },
     "plugins": ["@typescript-eslint"],
     "extends": [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended"
     ],
     "env": {
       "node": true,
       "es2022": true
     },
     "ignorePatterns": ["out/", "*.js"]
   }
   ```
2. Update `package.json` lint script from `eslint src` to `eslint src --ext .ts`
3. Add `// eslint-disable-next-line no-control-regex` above the OSC_REGEX in `src/oscParser.ts:6` (the escape sequence regex legitimately contains control characters)

**Acceptance Criteria:**
- `.eslintrc.json` exists with the configuration above
- `npm run lint` completes with exit code 0
- All existing TypeScript files pass linting without errors

### Task 2: Add GitHub Actions CI Workflow

**Description:**
Create a GitHub Actions workflow that runs on push and pull requests to validate code quality. Depends on Task 1.

**File:** `.github/workflows/ci.yml`

**Workflow Jobs:**
1. **Build & Test** - Single job that:
   - Checks out code
   - Sets up Node.js 20.x with npm caching
   - Installs dependencies
   - Runs linting (`npm run lint`)
   - Runs tests (`npm test` - this also compiles)

**Configuration:**
- Trigger on push to `main` and on pull requests
- Use `ubuntu-latest` runner
- Directory `.github/workflows/` will be created as part of adding the file

**Acceptance Criteria:**
- Workflow file exists at `.github/workflows/ci.yml`
- Workflow triggers on push to main and on pull requests
- Lint and test steps run in sequence
- Uses `actions/setup-node` with caching enabled

### Task 3: Add Dependabot Configuration

**Description:**
Configure Dependabot to automatically create PRs for npm and GitHub Actions dependency updates.

**File:** `.github/dependabot.yml`

**Configuration:**
- Check for npm updates weekly
- Check for GitHub Actions updates weekly
- Target the `main` branch

**Acceptance Criteria:**
- Dependabot config exists at `.github/dependabot.yml`
- Configured for both `npm` and `github-actions` ecosystems
- Uses weekly schedule

### Task 4: Bump Version

**Description:**
Increment patch version for tooling/infrastructure improvements.

**Changes:**
- Update version in `package.json` from `0.1.0` to `0.1.1`

**Acceptance Criteria:**
- Version is `0.1.1` in package.json
