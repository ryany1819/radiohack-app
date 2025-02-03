#!/bin/bash

if [[ "$(uname -s)" == "MINGW"* || "$(uname -s)" == "CYGWIN"* ]]; then
  PROJECT_PATH=$(pwd -W)
else
  PROJECT_PATH=$(pwd)
fi

# Get the target platform from the first argument (default to 'linux' if not provided)
PLATFORM=${1:-linux}

# Validate the platform
if [[ "$PLATFORM" != "win" && "$PLATFORM" != "mac" && "$PLATFORM" != "linux" ]]; then
  echo "❌ Invalid platform: $PLATFORM"
  echo "Usage: ./build-electron.sh [win|mac|linux] [output-directory]"
  exit 1
fi

# Run the Docker container with the specified platform and output directory
docker run --rm \
  -v "$PROJECT_PATH":/project \
  -v ~/.cache/electron:/root/.cache/electron \
  electronuserland/builder:wine \
  sh -c "pnpm install && pnpm run build && pnpm exec electron-builder --$PLATFORM"
