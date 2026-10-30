# Autonomous Shipping & Development Rules

## 1. Verified Production Coordinates
- **GitHub**: `co2023smniyazi/three-tier-student-management-system` (default branch: `main`)
- **Render Backend**: `https://three-tier-student-management-system.onrender.com` (Service: `srv-dbdlqg8473hc73cqg6sg`)
- **Vercel Frontend**: Project `three-tier-student-management-system` (Team: `co2023smniyazis-projects`)
- **MongoDB Atlas**: Project `6acf7f06ebae65614aac6bc2` (Cluster0)

## 2. Git & PR Workflow
- **No direct commits or pushes to `main`**: Always work on a branch named `feature/<name>`.
- **Pre-Push Quality Gate**: Always run `npm test` and `npm run build` locally before pushing. Fix any failures first.
- **Open PR & Halt**: Push the branch to origin, open a Pull Request with a summary of changes and verification results, then stop and wait. Do NOT merge the PR autonomously.

## 3. Post-Merge Verification Protocol
When the user confirms **"merged"**:
1. Monitor the Render deployment and Vercel production deployment until both status checks report live and healthy.
2. Inspect runtime logs on both services for startup errors, uncaught exceptions, or failed database connections.
3. Confirm live application health and report back with live production URLs.

## 4. Database Schema & Migration Policy
- **Schema Defaults**: Prefer setting default values in Mongoose models (e.g. `default: false`).
- **One-off Migrations**: Place all data transformation scripts in `scripts/migrations/`.
- **Dry-run by default**: The script must display the query filter and the count of affected documents without modifying data.
- **Explicit Apply**: Changes must only be applied when executed with the `--apply` flag.
- **Manual Execution**: The user reviews the PR and executes the migration manually on production.

## 5. Deployment Failure Protocol
- If a build or deployment fails, extract and report the exact cause from the logs.
- Stop immediately and report the error.
- Do NOT retry deployment or execute an automatic rollback without explicit instruction from the user.

## 6. Secrets & Environment Hygiene
- Never commit secrets, passwords, API tokens, `.env`, or `.env.*` files to git.
- Use environment variable references exclusively.
