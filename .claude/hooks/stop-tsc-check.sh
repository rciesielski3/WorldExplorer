#!/bin/bash
# Stop hook: run `tsc --noEmit` when the working tree has changed .ts/.tsx files.
#   0 errors   -> exit 0 (pass)
#   1-3 errors -> exit 0 with a warning on stderr (not blocking)
#   >3 errors  -> exit 2 (blocking: stderr is fed back to Claude, which keeps working)
# Loop guard: if `stop_hook_active` is true, Claude is already continuing after a block; exit 0.

INPUT=$(cat)
ERROR_THRESHOLD=3

if printf '%s' "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

[ -f tsconfig.json ] && [ -d node_modules/typescript ] || exit 0

# Only check when .ts/.tsx files changed (staged, unstaged or untracked).
CHANGED=$(git status --porcelain 2>/dev/null | grep -E '\.tsx?$' || true)
[ -n "$CHANGED" ] || exit 0

# --pretty false: no ANSI colours, so the "error TS" pattern is reliable.
OUTPUT=$(npx tsc --noEmit --pretty false 2>&1 || true)
ERRORS=$(printf '%s\n' "$OUTPUT" | grep -c 'error TS' || true)
ERRORS=${ERRORS:-0}

if [ "$ERRORS" -eq 0 ]; then
  echo "TSC CHECK PASSED - no TypeScript errors" >&2
  exit 0
fi

if [ "$ERRORS" -le "$ERROR_THRESHOLD" ]; then
  {
    echo "TSC CHECK WARNING: $ERRORS TypeScript error(s) (not blocking):"
    printf '%s\n' "$OUTPUT" | grep 'error TS'
  } >&2
  exit 0
fi

{
  echo "TSC CHECK FAILED: $ERRORS TypeScript errors (limit $ERROR_THRESHOLD)."
  echo "First 15 errors:"
  printf '%s\n' "$OUTPUT" | grep 'error TS' | head -15
  echo "Fix the TypeScript errors before finishing. Start with the first ones; later errors are often a cascade."
} >&2
exit 2
