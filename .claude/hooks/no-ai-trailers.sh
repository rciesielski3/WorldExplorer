#!/bin/sh
msg="$1"
[ -f "$msg" ] || { echo "no-ai-trailers: commit message file not found: $msg" >&2; exit 1; }

fail() {
  echo "no-ai-trailers: rejected, $1" >&2
  exit 1
}

grep -Eiq '^[[:space:]]*co-authored-by:.*(noreply@anthropic\.com|claude[[:space:]]*<)' "$msg" && fail "Co-Authored-By names Claude/Anthropic"
grep -Eiq '^[[:space:]]*claude-session:' "$msg" && fail "Claude-Session trailer"
grep -Eiq 'generated with.*claude' "$msg" && fail "'Generated with' footer"
exit 0
