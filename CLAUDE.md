# WorldExplorer Development Workflow

This document outlines the development workflow and best practices for WorldExplorer using Claude Code.

## 🔄 Development Completion Sequence

Every feature, bug fix, or significant change must follow this completion workflow **before merging to main**:

```
Implementation
     ↓
Code Review (agent)
     ↓
Fix Issues (if any)
     ↓
Test Coverage (agent)
     ↓
Verify Tests Pass
     ↓
Merge to Main
```

### 1. **Implementation**
- Complete feature/fix on feature branch (e.g., `feat/feature-name`, `fix/bug-name`)
- Commit regularly with clear messages
- Push to remote

### 2. **Code Review** (Assign Agent)
- Dispatch code-review agent to assess:
  - Spec compliance (does it match requirements?)
  - Code quality (patterns, style, types, error handling)
  - Architecture (design patterns, separation of concerns)
  - Performance (memoization, unnecessary re-renders)
  - Accessibility (WCAG AA compliance where applicable)
  - i18n (all user-facing strings localized)

**Agent Assignment:**
```
Dispatch general-purpose agent with code review focus:
- Examine all files modified
- Flag Critical (blocks merge), Important (should fix), Minor (nice to have)
- Report findings ranked by severity
```

### 3. **Fix Code Review Issues**
- Address Critical findings immediately
- Address Important findings before merge
- Document Minor findings (fix in next iteration if time permits)
- Re-run code review if significant changes made

### 4. **Test Coverage** (Assign Agent)
- Dispatch test-writing agent to add tests for changed areas
- Target coverage:
  - Unit tests for new functions/components
  - Integration tests for feature workflows
  - Edge case tests for bug fixes
  - Accessibility tests (if UI changed)

**Test Requirements:**
- Tests must pass locally (`npm test`)
- Tests must pass in CI workflow
- No test files in root `/docs/superpowers/` (keep repo clean)

### 5. **Verify Tests Pass**
```bash
npm test                  # Local tests
npx tsc --noEmit         # TypeScript validation
npm ci                   # Dependency resolution
```

### 6. **Merge to Main**
- Create PR with description of changes
- Merge only after code review + tests both pass
- Delete feature branch after merge

---

## 📋 Exception: Docs-Only Changes

**Skip code review + tests if:**
- Changes are docs-only (README, RELEASE_NOTES, comments)
- No code changes, no dependency changes
- Example: Typo fixes, formatting, documentation updates

---

## 🛠️ Tools & Conventions

### Import Paths
- All components: `src/components/` (no root `components/` folder)
- All screens: `src/screens/` or `screens/`
- Theme/context: `src/context/`, `src/theme/`
- Tests: `__tests__/` folder in same directory as source

### Naming Conventions
- Components: PascalCase (e.g., `Button.tsx`)
- Files: Match component name
- Tests: `ComponentName.test.tsx`
- Branches: `feat/feature-name`, `fix/bug-name`, `refactor/change-name`
- Commits: `type: short message` (feat:, fix:, refactor:, docs:, test:, chore:)

### Design System
- Use design tokens from `src/theme/tokens.ts` (no hardcoded colors/spacing)
- Follow Material Design 3 patterns (rounded corners 12-16dp, elevation, ripples)
- Support dark/light modes via `useTheme()` hook
- Ensure WCAG AA accessibility (4.5:1 contrast, 48dp touch targets, semantic labels)

### i18n
- All user-facing strings via `useTranslation()` from react-i18next
- Add translation keys to `src/locales/*.json` (en, es, fr, de, pl)
- Test with `npm run countries:validate` (i18n completeness)

---

## 📊 Code Review Checklist

When reviewing code, verify:

- [ ] **Spec Compliance** — Does implementation match the requirements?
- [ ] **Type Safety** — No `any` types, proper TypeScript
- [ ] **Error Handling** — Handles failures gracefully, not silent errors
- [ ] **Naming** — Clear, descriptive names for functions/variables/components
- [ ] **DRY** — No duplicated logic; reuses existing functions/components
- [ ] **YAGNI** — No over-engineering or unnecessary features
- [ ] **Tests** — New code has test coverage (after test agent runs)
- [ ] **Accessibility** — Color contrast, touch targets, semantic labels
- [ ] **Performance** — No unnecessary re-renders, proper memoization
- [ ] **i18n** — All user strings localized
- [ ] **Design Tokens** — Uses tokens, not hardcoded values
- [ ] **Git Hygiene** — Clear commits, no merge conflicts, clean history

---

## 🚀 Release Process

1. Bump version in `package.json` and `android/app/build.gradle`
2. Update `RELEASE_NOTES.md` with user-focused changes
3. Merge to main
4. Create GitHub release from tag
5. Deploy to Play Store (internal → beta → production)

---

## 📝 Memory System

Development decisions and workflow guidelines are stored in:
- `.claude/projects/.../memory/MEMORY.md` (index of all memories)
- `feedback_dev_workflow_rules.md` — This workflow
- `feedback_no_ai_attribution.md` — Git commit conventions
- `workflow_improvements_reference.md` — CI/CD best practices

Check memory on each new task to maintain consistency.

---

## ❓ Questions?

Refer to:
- [GitHub Issues](https://github.com/rciesielski3/WorldExplorer/issues) for feature requests/bugs
- [Design Spec](docs/superpowers/specs/) for current features
- [Implementation Plans](docs/superpowers/plans/) for ongoing work
- This file (CLAUDE.md) for workflow questions

---

## 📚 Obsidian Vault Reference

For daily notes, project context, and knowledge base — see: `~/Developer/obsidian-vault/CLAUDE.md`
