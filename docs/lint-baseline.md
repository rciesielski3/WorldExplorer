# ESLint baseline

Warnings present when ESLint was introduced. `npm run lint` fails if the total exceeds
`--max-warnings` in `package.json` (currently 315). Lower both numbers as warnings are fixed; never raise them.

| Rule | Warnings |
| --- | ---: |
| `no-restricted-syntax`: hardcoded hex color | 68 |
| `no-restricted-syntax`: hardcoded rgb/hsl color | 34 |
| `no-restricted-syntax`: interactive element missing `accessibilityLabel` | 40 |
| `@typescript-eslint/no-unused-vars` | 46 |
| `react-native-a11y/has-valid-accessibility-descriptors` | 38 |
| `@typescript-eslint/no-floating-promises` | 35 |
| `@typescript-eslint/no-explicit-any` | 18 |
| `@typescript-eslint/no-require-imports` | 20 |
| `no-console` | 11 |
| `no-case-declarations` | 2 |
| `react-hooks/exhaustive-deps` | 3 |
| `prefer-const` | 0 (4 autofixed in `src/__tests__/i18n.test.ts`) |
| **Total** | **315** |

Rules at `error` (zero hits): `no-empty`, `react-hooks/rules-of-hooks`, all `eslint-plugin-react-native-a11y`
rules except `has-valid-accessibility-descriptors`, and all remaining `@eslint/js` / `typescript-eslint` recommended rules.

Notes:

- Color literals and the missing-label check are `no-restricted-syntax` selectors; tests, `jest.*` setup and `scripts/` are exempt from color/console/any rules.
- `utils/flagAssets.ts` is exempt from `no-require-imports` (static `require()` asset map, 250 hits, idiomatic in React Native).
- `eslint-plugin-react-native-a11y` 3.5.1 declares ESLint ^3-^8 peers but its rules work under ESLint 9 flat config; installed with
  an npm `overrides` entry, no fork needed.
