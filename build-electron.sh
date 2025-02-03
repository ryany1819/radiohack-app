#!/bin/bash

# Get the absolute project path
PROJECT_PATH=$(realpath .)

# Get the target platform from the first argument (default to 'linux' if not provided)
PLATFORM=${1:-linux}

# Validate the platform
if [[ "$PLATFORM" != "win" && "$PLATFORM" != "mac" && "$PLATFORM" != "linux" ]]; then
  echo "❌ Invalid platform: $PLATFORM"
  echo "Usage: ./build-electron.sh [win|mac|linux]"
  exit 1
fi

# Run the Docker container with the specified platform
docker run --rm \
  -v "$PROJECT_PATH":/project \
  -v ~/.cache/electron:/root/.cache/electron \
  electronuserland/builder:wine \
  sh -c "pnpm install --frozen-lockfile && pnpm run build && pnpm exec electron-builder --$PLATFORM"
