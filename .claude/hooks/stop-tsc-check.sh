#!/bin/bash
# Stop hook: run `tsc --noEmit` when the working tree has changed .ts/.tsx files.
#   0 errors   -> exit 0 (pass)
#   1-3 errors -> exit 0 with a warning shown to the user via JSON "systemMessage" on stdout
#                 (not blocking; stderr of a passing hook is only visible in verbose mode, so it is not used)
#   >3 errors  -> exit 2 (blocking: stderr is fed back to Claude, which keeps working)
#   tsc exits non-zero without any "error TS" line -> exit 0 with a warning (tool/config problem, not a PASS)
# Loop guard: if `stop_hook_active` is true, Claude is already continuing after a block; exit 0.

INPUT=$(cat)
ERROR_THRESHOLD=3

if printf '%s' "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

[ -f tsconfig.json ] && [ -d node_modules/typescript ] || exit 0

# Only check when .ts/.tsx files changed (staged, unstaged or untracked).
# -uall lists individual files inside untracked directories.
CHANGED=$(git status --porcelain -uall 2>/dev/null | grep -E '\.tsx?$' || true)
[ -n "$CHANGED" ] || exit 0

# Non-blocking message the user can see: JSON on stdout, exit 0.
warn() {
  local msg
  msg=$(printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' ' ')
  printf '{"systemMessage": "%s"}\n' "$msg"
}

# --pretty false: no ANSI colours, so the "error TS" pattern is reliable.
OUTPUT=$(npx tsc --noEmit --pretty false 2>&1)
TSC_EXIT=$?
ERRORS=$(printf '%s\n' "$OUTPUT" | grep -c 'error TS' || true)
ERRORS=${ERRORS:-0}

if [ "$ERRORS" -eq 0 ]; then
  if [ "$TSC_EXIT" -ne 0 ]; then
    warn "TSC CHECK WARNING: tsc exited with code $TSC_EXIT but reported no 'error TS' lines (tool or config problem). Output: $(printf '%s\n' "$OUTPUT" | head -5)"
    exit 0
  fi
  echo "TSC CHECK PASSED - no TypeScript errors" >&2
  exit 0
fi

if [ "$ERRORS" -le "$ERROR_THRESHOLD" ]; then
  warn "TSC CHECK WARNING: $ERRORS TypeScript error(s) (not blocking): $(printf '%s\n' "$OUTPUT" | grep 'error TS')"
  exit 0
fi

{
  echo "TSC CHECK FAILED: $ERRORS TypeScript errors (limit $ERROR_THRESHOLD)."
  echo "First 15 errors:"
  printf '%s\n' "$OUTPUT" | grep 'error TS' | head -15
  echo "Fix the TypeScript errors before finishing. Start with the first ones; later errors are often a cascade."
} >&2
exit 2
