# Release Guide

## TL;DR - Create a Release

```bash
# Configure once (first time only)
export DOCKER_USERNAME="your-dockerhub-username"

# Create release (every time)
git checkout main
git pull
npm run release:patch  # or minor, or major
```

## Detailed Steps

### 1. First Time Setup (Do Once)

#### A. Create Docker Hub Account
- Go to https://hub.docker.com
- Sign up / Login
- Note your username

#### B. Configure GitHub Secrets
```bash
# Go to your repository on GitHub
# Settings → Secrets and variables → Actions → New repository secret

# Add these TWO secrets:
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-password
```

#### C. Update Workflow Files (if needed)
```bash
# Edit .github/workflows/release.yml
# Update DOCKER_USERNAME if using hardcoded value
```

### 2. Create a Release (Every Time)

```bash
# Step 1: Ensure main branch is up to date
git checkout main
git pull origin main

# Step 2: Make sure working directory is clean
git status  # Should show "nothing to commit, working tree clean"

# Step 3: Choose release type and run
npm run release:patch   # Bug fixes: 1.0.0 → 1.0.1
# OR
npm run release:minor   # New features: 1.0.0 → 1.1.0
# OR
npm run release:major   # Breaking changes: 1.0.0 → 2.0.0
```

### 3. Monitor the Release

```bash
# Watch GitHub Actions
# Go to: https://github.com/your-username/notes-app/actions

# The "Release" workflow should be running
# Wait for all steps to complete (usually 5-10 minutes)
```

### 4. Verify the Release

```bash
# Pull the new image
docker pull your-dockerhub-username/notes-app:latest

# Run it
docker run -d -p 3000:3000 \
  -e DB_HOST=localhost \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=notes_app \
  your-dockerhub-username/notes-app:latest

# Test it
curl http://localhost:3000/health

# Should return: {"status":"OK","timestamp":"..."}
```

## Troubleshooting

### Release workflow not running?

**Check 1: Was the tag pushed?**
```bash
git ls-remote --tags origin | grep v1.0.0
```

**Fix:**
```bash
git push origin v1.0.0
```

**Check 2: Is tag format correct?**
Tags must start with `v` (e.g., `v1.0.0`, not `1.0.0`)

### Docker push failing?

**Check GitHub Secrets:**
```bash
# Go to: Settings → Secrets and variables → Actions
# Verify DOCKER_USERNAME and DOCKER_PASSWORD exist
```

**Test locally:**
```bash
docker login
# Use your Docker Hub credentials
```

### Need to redo a release?

```bash
# Delete the tag locally
git tag -d v1.0.0

# Delete the tag remotely
git push --delete origin v1.0.0

# Fix the issue, then create tag again
git tag v1.0.0
git push origin v1.0.0
```

## Manual Release Process (Alternative)

If the script doesn't work, do it manually:

```bash
# 1. Update version
npm version patch  # or minor, or major

# 2. Push everything
git push origin main --tags

# 3. Wait for GitHub Actions
```

## What Happens During Release?

1. **GitHub Actions Detects Tag**
   - Workflow triggered by `v*` tag pattern

2. **Build & Test**
   - Runs unit tests
   - Builds Docker image

3. **Push to Docker Hub**
   - Tags: `your-username/notes-app:1.0.0`
   - Tags: `your-username/notes-app:latest`

4. **Create GitHub Release**
   - Generates changelog from commits
   - Attaches package.json
   - Creates release notes

5. **Notify Team** (optional)
   - Sends Slack notification
   - Emails team (if configured)

## Quick Reference

| Command | Version Change | Example |
|---------|---------------|---------|
| `npm run release:patch` | 1.0.0 → 1.0.1 | Bug fixes |
| `npm run release:minor` | 1.0.0 → 1.1.0 | New features |
| `npm run release:major` | 1.0.0 → 2.0.0 | Breaking changes |

## Need Help?

1. Check workflow logs: `https://github.com/your-username/notes-app/actions`
2. Verify Docker Hub: `https://hub.docker.com/r/your-username/notes-app`
3. Check releases: `https://github.com/your-username/notes-app/releases`
