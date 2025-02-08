#!/bin/bash

# Check if the correct number of arguments are provided
if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <tag-name> <release-title> <platform>"
  echo ""
  echo "Examples for tag-name:"
  echo "  Official release: v1.0.0"
  echo "  Release candidate: v1.0.0-rc.1"
  echo ""
  echo "Examples for platform:"
  echo "  win, mac, linux"
  exit 1
fi

# Get the current branch name
FEATURE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TAG_NAME=$1
RELEASE_TITLE=$2
PLATFORM=$3

# Merge the feature branch into the master branch
git checkout master
git merge $FEATURE_BRANCH

# Extract version from package.json without using jq
VERSION=$(grep '"version"' package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')
echo "Extracted version: $VERSION"

# Run the build script based on the platform
case $PLATFORM in
  win)
    pnpm build:win
    ARTIFACT_PATH="./dist/radiohack-app-$VERSION-setup.exe"
    ;;
  mac)
    pnpm build:mac
    ARTIFACT_PATH="path/to/mac/installer.dmg"
    ;;
  linux)
    pnpm build:linux
    ARTIFACT_PATH="path/to/linux/installer.AppImage"
    ;;
  *)
    echo "Invalid platform: $PLATFORM"
    exit 1
    ;;
esac

# Create a tag for the release
git tag -a $TAG_NAME -m "$RELEASE_TITLE"

# Push the changes and the tag to GitHub
git push origin master
git push origin $TAG_NAME

# Create a release on GitHub using the GitHub CLI and upload the artifact
gh release create $TAG_NAME --title "$RELEASE_TITLE" --notes "Release $RELEASE_TITLE" $ARTIFACT_PATH
