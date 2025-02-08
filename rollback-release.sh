#!/bin/bash

# Check if the correct number of arguments are provided
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <tag-name>"
  exit 1
fi

TAG_NAME=$1

# Delete the tag locally
git tag -d $TAG_NAME

# Delete the tag remotely
git push origin :refs/tags/$TAG_NAME

# Delete the release on GitHub using the GitHub CLI
gh release delete $TAG_NAME --yes

echo "Rollback of release $TAG_NAME completed."
