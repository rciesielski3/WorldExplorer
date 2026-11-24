#!/bin/bash
# Test for stop-tsc-check.sh. Uses a throwaway git repo and a stub `npx` on PATH, so no real tsc is needed.
# Usage: .claude/hooks/test-stop-tsc-check.sh
HOOK="$(cd "$(dirname "$0")" && pwd)/stop-tsc-check.sh"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
FAILS=0

mkdir -p "$TMP/proj/node_modules/typescript" "$TMP/bin"
cd "$TMP/proj" || exit 1
git init -q . && echo '{}' > tsconfig.json
git add . 2>/dev/null; git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init

# Stub npx: prints $STUB_ERRORS fake tsc errors.
cat > "$TMP/bin/npx" <<'STUB'
#!/bin/bash
i=0
while [ "$i" -lt "${STUB_ERRORS:-0}" ]; do
  i=$((i + 1))
  echo "src/file$i.ts($i,1): error TS2322: Type 'string' is not assignable to type 'number'."
done
STUB
chmod +x "$TMP/bin/npx"
export PATH="$TMP/bin:$PATH" CLAUDE_PROJECT_DIR="$TMP/proj"

run() { # name, expected exit, stdin json, stub errors
  local out code
  out=$(printf '%s' "$3" | STUB_ERRORS="$4" "$HOOK" 2>&1); code=$?
  if [ "$code" -eq "$2" ]; then echo "PASS $1 (exit $code)"; else echo "FAIL $1: expected $2, got $code"; FAILS=$((FAILS + 1)); fi
  printf '%s\n' "$out" | sed 's/^/     /' | head -3
}

echo 'export const a = 1;' > a.ts
run "0 errors"               0 '{"stop_hook_active": false}' 0
run "2 errors (warn only)"   0 '{"stop_hook_active": false}' 2
run "4 errors (blocks)"      2 '{"stop_hook_active": false}' 4
run "stop_hook_active=true"  0 '{"stop_hook_active": true}'  9

rm a.ts
echo 'notes' > notes.md
run "no .ts changes (skip)"  0 '{"stop_hook_active": false}' 9

# Regression: new .ts file inside an untracked directory must trigger the check (-uall).
mkdir -p newdir/sub && echo 'export const b = 2;' > newdir/sub/b.ts
run "untracked dir .ts (blocks)" 2 '{"stop_hook_active": false}' 4
rm -rf newdir

# tsc fails without any "error TS" line -> warning, not PASSED.
echo 'export const c = 3;' > c.ts
cat > "$TMP/bin/npx" <<'STUB'
#!/bin/bash
echo "tsc: crashed unexpectedly"
exit 1
STUB
out=$(printf '%s' '{"stop_hook_active": false}' | "$HOOK" 2>/dev/null); code=$?
if [ "$code" -eq 0 ] && printf '%s' "$out" | grep -q 'systemMessage' && ! printf '%s' "$out" | grep -q PASSED; then
  echo "PASS tsc fails without error TS (warning, exit 0)"
else
  echo "FAIL tsc fails without error TS: code=$code out=$out"; FAILS=$((FAILS + 1))
fi
rm c.ts

[ "$FAILS" -eq 0 ] && echo "ALL PASSED" || { echo "$FAILS FAILED"; exit 1; }
