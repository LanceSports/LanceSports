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
# Create a feature branch
git checkout -b feature/my-feature

# Stage and commit changes
git add .
git commit -m "feat(module): short description"

# Push branch and open PR
git push origin feature/my-feature
