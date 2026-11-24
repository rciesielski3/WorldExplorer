#!/bin/sh
# Rejects commit messages that carry any AI participation info (trailers, footers, robot emoji).
msg="$1"
[ -f "$msg" ] || { echo "no-ai-trailers: commit message file not found: $msg" >&2; exit 1; }

fail() {
  echo "no-ai-trailers: rejected, $1" >&2
  exit 1
}

AI_NAMES='claude|anthropic|openai|chatgpt|copilot|gemini|cursor|codex|sonnet|opus|haiku|fable'
# "ai" as a whole word (portable, no \b)
AI_WORD='(^|[^[:alnum:]_])ai([^[:alnum:]_]|$)'

grep -Eiq "^[[:space:]]*(co-authored-by|assisted-by|generated-by):.*(${AI_NAMES}|${AI_WORD})" "$msg" && fail "AI name in Co-Authored-By/Assisted-By/Generated-By trailer"
grep -Eiq '^[[:space:]]*claude-session:' "$msg" && fail "Claude-Session trailer"
grep -Eiq "(generated|created|written|authored|made)[[:space:]].*(with|by).*(${AI_NAMES})" "$msg" && fail "AI authorship footer"
grep -q '🤖' "$msg" && fail "robot emoji footer"
exit 0
