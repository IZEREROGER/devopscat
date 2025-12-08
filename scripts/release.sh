#!/bin/bash
# filepath: /home/ubuntu/notes/scripts/release.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="${DOCKER_REGISTRY:-docker.io}"
USERNAME="${DOCKER_USERNAME:-yourusername}"
IMAGE_NAME="${DOCKER_IMAGE_NAME:-notes-app}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on main branch
check_branch() {
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        log_error "Releases must be made from main branch"
        log_error "Current branch: $CURRENT_BRANCH"
        exit 1
    fi
    log_info "Branch check passed: $CURRENT_BRANCH"
}

# Check for uncommitted changes
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Working directory is not clean"
        log_error "Please commit or stash changes before release"
        git status --short
        exit 1
    fi
    log_info "Git status check passed"
}

# Get current version from package.json
get_current_version() {
    node -p "require('./package.json').version"
}

# Bump version
bump_version() {
    local bump_type=$1
    log_info "Bumping version ($bump_type)..."
    npm version $bump_type --no-git-tag-version
    NEW_VERSION=$(get_current_version)
    log_info "New version: $NEW_VERSION"
}

# Create git tag
create_tag() {
    local version=$1
    log_info "Creating git tag: v$version"
    git add package.json package-lock.json
    git commit -m "chore: bump version to $version"
    git tag -a "v$version" -m "Release version $version"
}

# Build Docker image
build_docker() {
    local version=$1
    log_info "Building Docker image..."
    docker build -t "${USERNAME}/${IMAGE_NAME}:${version}" .
    docker tag "${USERNAME}/${IMAGE_NAME}:${version}" "${USERNAME}/${IMAGE_NAME}:latest"
    log_info "Docker images built successfully"
}

# Push Docker images
push_docker() {
    local version=$1
    log_info "Pushing Docker images to registry..."
    
    if [ -z "$DOCKER_PASSWORD" ]; then
        log_warn "DOCKER_PASSWORD not set, attempting interactive login"
        docker login
    else
        echo "$DOCKER_PASSWORD" | docker login -u "$USERNAME" --password-stdin
    fi
    
    docker push "${USERNAME}/${IMAGE_NAME}:${version}"
    docker push "${USERNAME}/${IMAGE_NAME}:latest"
    log_info "Docker images pushed successfully"
}

# Push git changes
push_git() {
    local version=$1
    log_info "Pushing changes to remote..."
    git push origin main
    git push origin "v$version"
    log_info "Git changes pushed successfully"
}

# Generate release notes
generate_release_notes() {
    local version=$1
    local prev_tag=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
    
    log_info "Generating release notes..."
    
    cat > RELEASE_NOTES_${version}.md << EOF
# Release Notes - v${version}

**Release Date:** $(date +"%Y-%m-%d")

## Changes

EOF
    
    if [ -n "$prev_tag" ]; then
        echo "### Commits since ${prev_tag}" >> RELEASE_NOTES_${version}.md
        git log ${prev_tag}..HEAD --pretty=format:"- %s (%h)" >> RELEASE_NOTES_${version}.md
    else
        echo "### All commits" >> RELEASE_NOTES_${version}.md
        git log --pretty=format:"- %s (%h)" >> RELEASE_NOTES_${version}.md
    fi
    
    cat >> RELEASE_NOTES_${version}.md << EOF


## Docker Images

\`\`\`bash
docker pull ${USERNAME}/${IMAGE_NAME}:${version}
docker pull ${USERNAME}/${IMAGE_NAME}:latest
\`\`\`

## Deployment

\`\`\`bash
docker run -d -p 3000:3000 \\
  -e DB_HOST=your-db-host \\
  -e DB_USER=your-db-user \\
  -e DB_PASSWORD=your-db-password \\
  -e DB_NAME=notes_app \\
  ${USERNAME}/${IMAGE_NAME}:${version}
\`\`\`

## Installation

\`\`\`bash
npm install notes-app@${version}
\`\`\`

---
**Full Changelog:** https://github.com/yourusername/notes-app/compare/${prev_tag}...v${version}
EOF
    
    log_info "Release notes saved to RELEASE_NOTES_${version}.md"
}

# Main release flow
main() {
    log_info "Starting release process..."
    
    # Check if version bump type is provided
    if [ $# -eq 0 ]; then
        log_error "Usage: $0 [patch|minor|major]"
        exit 1
    fi
    
    BUMP_TYPE=$1
    
    # Validate bump type
    if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
        log_error "Invalid version bump type: $BUMP_TYPE"
        log_error "Must be one of: patch, minor, major"
        exit 1
    fi
    
    # Pre-flight checks
    check_branch
    check_git_status
    
    # Get current version
    CURRENT_VERSION=$(get_current_version)
    log_info "Current version: $CURRENT_VERSION"
    
    # Bump version
    bump_version $BUMP_TYPE
    NEW_VERSION=$(get_current_version)
    
    # Confirm release
    echo ""
    log_warn "Ready to release version $NEW_VERSION"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Release cancelled"
        git checkout package.json package-lock.json
        exit 1
    fi
    
    # Create git tag
    create_tag $NEW_VERSION
    
    # Build Docker images
    build_docker $NEW_VERSION
    
    # Push Docker images
    push_docker $NEW_VERSION
    
    # Push git changes
    push_git $NEW_VERSION
    
    # Generate release notes
    generate_release_notes $NEW_VERSION
    
    log_info "✅ Release v$NEW_VERSION completed successfully!"
    log_info "Next steps:"
    log_info "  1. Review RELEASE_NOTES_${NEW_VERSION}.md"
    log_info "  2. Create GitHub release at https://github.com/yourusername/notes-app/releases/new"
    log_info "  3. Upload release notes"
}

# Run main function
main "$@"