# CI/CD Maintenance Guide for Evently Project

This guide provides information on how to maintain and troubleshoot the CI/CD pipeline for the Evently project.

## Workflow Overview

The main CI/CD workflow for the Evently frontend is located in `.github/workflows/deploy-frontend.yml`. This workflow:

1. Triggers on pushes or pull requests to the main/master branch that modify files in the `evently-frontend` directory
2. Sets up Node.js and pnpm
3. Installs dependencies
4. Creates necessary environment files
5. Deploys to Vercel

## Required Secrets

The following GitHub secrets must be set in your repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `DATABASE_URL`: URL for your database

You can set these secrets in your GitHub repository settings under Secrets and Variables > Actions.

## Environment Variables

The deployment creates an `.env` file with the following variables:

```
NEXT_PUBLIC_API_BASE_URL=https://evently-backend-amber.vercel.app
NEXTAUTH_URL=https://evently-nine-iota.vercel.app
NEXTAUTH_SECRET=<from GitHub secrets>
GOOGLE_CLIENT_ID=<from GitHub secrets>
GOOGLE_CLIENT_SECRET=<from GitHub secrets>
DATABASE_URL=<from GitHub secrets>
```

## Troubleshooting Common Issues

### "Resource not accessible by integration" Error

If you see this error, it usually means the GitHub token doesn't have enough permissions. The workflow includes the necessary permissions for:
- Reading repository content
- Writing to pull requests
- Writing to issues
- Writing to repository projects

If you're still encountering this error, check:
1. That the permissions block in the workflow yaml is correct
2. That the `github-token` is passed correctly to the Vercel action
3. That the repository settings allow workflows to create and approve pull requests

### Vercel Deployment Issues

For Vercel deployment issues:

1. Verify your `VERCEL_TOKEN` is correct and not expired
2. Check that the project name in the workflow (`evently`) matches your Vercel project
3. Confirm that the scope in the workflow matches your Vercel team ID
4. Review Vercel logs for specific errors

## Maintaining the Workflow

When updating the workflow:

1. Avoid adding ESLint or Lighthouse steps as they've been removed for simplicity
2. Keep the environment variable setup updated if new variables are needed
3. Test changes by making a small PR that modifies a file in the frontend directory
4. Monitor workflow logs for any new errors

## Vercel Configuration

The project uses a simplified `vercel.json` configuration that does not include a `builds` section, as this is handled automatically by Vercel based on the project structure.

## GitHub Permissions

The workflow has been configured with the following permissions:
- `contents: read` - For accessing repository content
- `pull-requests: write` - For commenting on PRs
- `issues: write` - For updating issues
- `repository-projects: write` - For updating project boards

These permissions allow the workflow to deploy to Vercel and provide feedback through GitHub comments.
