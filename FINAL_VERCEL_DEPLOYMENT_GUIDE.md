# Vercel Deployment Guide & Troubleshooting

## Overview

This is the complete guide for deploying the Evently frontend to Vercel using GitHub Actions. We've simplified the deployment process to eliminate unnecessary complexity and make it more reliable.

## Current Deployment Method

We are now using a simplified approach that:

1. Runs tests in the CI pipeline
2. Uses `amondnet/vercel-action` to deploy directly to Vercel
3. Deploys to production on pushes to main/master branches
4. Creates preview deployments for pull requests

## Setup Instructions

### 1. GitHub Repository Setup

1. **Set Required Secrets**: Ensure these secrets are set in your GitHub repository:
   - `VERCEL_TOKEN`: Personal access token from Vercel
   - `NEXTAUTH_SECRET`: Secret for NextAuth.js
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
   - `DATABASE_URL`: Database connection string

2. **Run the Setup Script**: Use the provided script to set up all secrets at once:
   ```bash
   chmod +x setup-github-secrets-updated.sh
   ./setup-github-secrets-updated.sh
   ```

### 2. Vercel Setup

1. **Create a Vercel Project**:
   - Go to Vercel and create a new project linked to your GitHub repository
   - Import the repository and set up the frontend project
   - Note the project name (default is "evently")

2. **Create a Personal Access Token**:
   - Go to Vercel → Settings → Tokens
   - Create a new token with sufficient permissions
   - Use this token for the `VERCEL_TOKEN` secret

3. **Set Environment Variables in Vercel**:
   - Set the same environment variables in Vercel dashboard that you use in local development

## How to Verify the Setup

After setting up the workflow and pushing to GitHub:

1. **Check GitHub Actions**: Go to the Actions tab in your repository
2. **Verify Workflow Runs**: Check that the workflow runs successfully
3. **Check Vercel Deployments**: Verify that preview deployments are created for PRs
4. **Test Production Deploy**: Push to main and check production deployment

## Troubleshooting Common Issues

### Issue: Workflow fails with "Missing required field 'vercel-token'"
**Solution**: Make sure the `VERCEL_TOKEN` secret is set in your repository settings

### Issue: Vercel deployment fails with "Not authorized"
**Solution**: 
1. Verify your Vercel token is valid
2. Regenerate the token if necessary
3. Update the GitHub secret with the new token

### Issue: Tests pass but deployment fails
**Solution**:
1. Check the workflow logs for specific error messages
2. Verify Vercel project link is correct
3. Ensure the project name in the workflow matches your Vercel project

### Issue: Environment variables not available in deployed app
**Solution**:
1. Make sure environment variables are set in Vercel dashboard
2. Check that you're using the correct variable names in your app
3. Rebuild and redeploy the application

### Issue: Preview deployments not created for PRs
**Solution**:
1. Verify the workflow is triggered for PRs
2. Check that the PR is for the branch specified in the workflow
3. Ensure the workflow is configured to run for PRs

## Best Practices

1. **Keep Secrets Secure**: Never commit secrets to the repository
2. **Test Locally First**: Verify everything works locally before pushing
3. **Use Branch Protection**: Set up branch protection rules to prevent pushing directly to main
4. **Review Logs**: Always check GitHub Actions and Vercel logs for issues
5. **Update Dependencies**: Regularly update dependencies to avoid security issues

## Maintenance

To maintain the deployment setup:

1. **Review Workflow File**: Periodically check the workflow file for updates
2. **Update Vercel Token**: Regenerate and update your Vercel token periodically
3. **Check Dependencies**: Keep all dependencies up to date
4. **Monitor Build Times**: Watch for increasing build times that might indicate issues

## References

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [amondnet/vercel-action](https://github.com/amondnet/vercel-action)
