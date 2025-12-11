#!/bin/bash

# Release script for iom-sdk
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

VERSION_TYPE=${1:-patch}

echo "🚀 Starting release process..."
echo "📦 Version bump type: $VERSION_TYPE"

# Ensure we're on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo "❌ Error: Please switch to main/master branch before releasing"
    exit 1
fi

# Ensure working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Error: Working directory is not clean. Please commit or stash changes."
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin $CURRENT_BRANCH

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run tests
echo "🧪 Running tests..."
pnpm test

# Run linting
echo "🔍 Running linting..."
pnpm lint

# Build package
echo "🔨 Building package..."
pnpm build

# Bump version and create tag
echo "📈 Bumping version ($VERSION_TYPE)..."
npm version $VERSION_TYPE --no-git-tag-version

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ New version: v$NEW_VERSION"

# Commit the version change and create tag
echo "📝 Committing version change..."
git add package.json pnpm-lock.json 2>/dev/null || git add package.json
git commit -m "chore: bump version to v$NEW_VERSION"

echo "🏷️ Creating git tag..."
git tag "v$NEW_VERSION"

# Push changes and tags
echo "📤 Pushing changes and tags..."
git push origin $CURRENT_BRANCH
git push origin --tags

echo "🎉 Release v$NEW_VERSION created successfully!"
echo "📝 The GitHub Action will automatically publish to NPM when the tag is pushed."
echo "🔗 Check the Actions tab in GitHub to monitor the publishing process."
