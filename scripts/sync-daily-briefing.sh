#!/bin/zsh

set -euo pipefail

NODE="/Users/a/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ -f "$SCRIPT_DIR/../.env.local" ]]; then
  set -a
  source "$SCRIPT_DIR/../.env.local"
  set +a
fi

"$NODE" "$SCRIPT_DIR/sync-daily-briefing.mjs"
