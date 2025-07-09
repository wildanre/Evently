# Simplified Vercel Deployment Workflow

This document explains the simplified deployment workflow for the Evently frontend to Vercel using GitHub Actions. This updated approach removes unnecessary complexity and eliminates the need for explicit Vercel project IDs in the workflow.

## Overview of Changes

We've made the following improvements to the deployment workflow:

1. **Removed Complexity**: Eliminated ESLint and Lighthouse checks from the pipeline
2. **Simplified Deployment**: Using `amondnet/vercel-action` to deploy directly to Vercel
3. **Reduced Secret Requirements**: No longer need to store Vercel Project ID or Org ID as secrets
4. **Better Environment Handling**: Improved environment variable management

## How It Works

The new workflow in `.github/workflows/deploy-frontend-final.yml` follows this process:

1. **Test Job**:
   - Runs on pushes to main/master or pull requests
   - Sets up pnpm and Node.js
   - Creates test environment variables
   - Runs type checking and unit tests

2. **Deploy Job**:
   - Only runs on push to main/master or manual workflow dispatch
   - Uses `amondnet/vercel-action` to deploy directly to Vercel
   - Automatically determines if it should be a production or preview deployment

## Required GitHub Secrets

The workflow requires the following secrets to be set in your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel personal access token
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `DATABASE_URL`: Your database connection string

## Setting Up the Secrets

You can use the updated script to set up all required secrets:

```bash
# Make the script executable
chmod +x setup-github-secrets-updated.sh

# Run the script
./setup-github-secrets-updated.sh
```

## Vercel Configuration

This workflow assumes:

1. Your Vercel project is linked to your GitHub repository
2. You have created a Vercel personal access token
3. Your project name in Vercel matches "evently" or has been updated in the workflow file

## Troubleshooting

If you encounter issues with the deployment:

1. **Check GitHub Secrets**: Ensure all required secrets are set
2. **Verify Vercel Token**: Make sure your Vercel token is valid and has the correct permissions
3. **Review Action Logs**: Check the GitHub Actions workflow logs for detailed error messages
4. **Vercel Project Name**: Confirm the project name matches what's in your Vercel dashboard

## Migration from Previous Workflow

If you were using the previous workflow with explicit Vercel Project ID and Org ID, you can safely switch to this new approach:

1. Update to the new workflow file
2. Remove any unnecessary secrets (VERCEL_PROJECT_ID, etc.)
3. Ensure you have a valid VERCEL_TOKEN

The new workflow will automatically determine the correct project based on your repository link in Vercel.

## Future Improvements

Potential future improvements to consider:

1. Adding caching for faster builds
2. Implementing branch-specific environment variables
3. Setting up automatic preview cleanup for PR deployments
