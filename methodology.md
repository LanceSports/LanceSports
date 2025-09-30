# Git Methodology – LanceSports

We are using a **GitHub Organization (LanceSports)** with a **single repository** containing both frontend and backend code.  
All contributions go through **Pull Requests (PRs)** to ensure code review before merging into `main`.

## Workflow

- **Branching:**
  - `main` – stable production code
  - `feature/<name>` – new features
  - `bugfix/<name>` – fixes

- **Pull Requests:**
  - All code changes must be submitted as a PR.
  - At least one teammate reviews before merge.
  - No direct pushes to `main`.

- **Commit Rules:**
  - Write clear messages: `feat(api): add live score endpoint`
  - Keep commits small and focused.

- **Automation (Planned):**
  - GitHub Actions for linting, formatting, and testing.
  - ESLint + Prettier for consistent code style.
  - Jest for backend tests (later).

## Key Commands

```bash
so lets assume we have a main brnch that has some code or inititl code thats clean and ready for production,
as the developer you pull main locally
you then create a feature branch to iterate any change sto the main
# Create a feature branch
git checkout -b feature/my-feature
you commit and stage these changes

# Stage and commit changes
git add .
git commit -m "feat(module): short description"

you push the branch, now its in the repo online and you open a PR so that a fellow collabroator can review the code, if okay tghen we push to main

# Push branch and open PR
git push origin feature/my-feature
```
