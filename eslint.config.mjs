// ESLint 9 flat config. Severity policy: `error` only for rules with zero existing
// hits; rules with existing hits are `warn` and ratcheted via `--max-warnings`
// (see docs/lint-baseline.md and the `lint` script).
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import a11y from "eslint-plugin-react-native-a11y";
import globals from "globals";

const INTERACTIVE =
  "/^(TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback|TouchableNativeFeedback|Pressable|Button|IconButton|Switch|TextInput)$/";

const noColorLiterals = [
  {
    selector: "Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
    message: "Hardcoded hex color. Use design tokens from theme/tokens.ts.",
  },
  {
    selector: "Literal[value=/\\b(rgb|rgba|hsl|hsla)\\(/i]",
    message: "Hardcoded rgb/hsl color. Use design tokens from theme/tokens.ts.",
  },
  {
    selector: "TemplateElement[value.raw=/\\b(rgb|rgba|hsl|hsla)\\(/i]",
    message: "Hardcoded rgb/hsl color. Use design tokens from theme/tokens.ts.",
  },
];

const missingA11yLabel = {
  selector: `JSXOpeningElement[name.name=${INTERACTIVE}]:not(:has(JSXAttribute[name.name=/^(accessibilityLabel|aria-label|accessibilityLabelledBy)$/]))`,
  message: "Interactive element is missing accessibilityLabel.",
};

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "android/**",
      "ios/**",
      ".expo/**",
      ".claude/**",
      ".codex-local/**",
      "dist/**",
      "web-build/**",
      "coverage/**",
      "assets/**",
      "data/**",
      "patches/**",
      "docs/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.node, ...globals.jest, __DEV__: "readonly" },
    },
    plugins: { "react-hooks": reactHooks, "react-native-a11y": a11y },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "no-empty": "error",
      // Recommended rules that already have hits: downgraded to warn (ratchet baseline).
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "prefer-const": "warn",
      "no-case-declarations": "warn",
      "no-console": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-restricted-syntax": ["warn", ...noColorLiterals, missingA11yLabel],
      // react-native-a11y (v3.5 declares ESLint <=8 peers but works unchanged with flat config)
      "react-native-a11y/has-accessibility-props": "error",
      "react-native-a11y/has-valid-accessibility-role": "error",
      "react-native-a11y/has-valid-accessibility-state": "error",
      "react-native-a11y/has-valid-accessibility-value": "error",
      "react-native-a11y/has-valid-accessibility-actions": "error",
      "react-native-a11y/has-valid-accessibility-descriptors": "warn",
      "react-native-a11y/has-valid-accessibility-live-region": "error",
      "react-native-a11y/has-valid-important-for-accessibility": "error",
      "react-native-a11y/no-nested-touchables": "error",
    },
  },
  {
    // Type-aware rules only where needed (keeps lint time low).
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "warn",
    },
  },
  {
    files: ["theme/tokens.ts"],
    rules: { "no-restricted-syntax": ["warn", missingA11yLabel] },
  },
  {
    files: [
      "**/__tests__/**",
      "**/*.test.{ts,tsx,js,jsx}",
      "tests/**",
      "jest.setup.js",
      "jest.mocks/**",
      "scripts/**",
    ],
    rules: {
      "no-restricted-syntax": "off",
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // React Native bundles static assets via require(); this is the idiomatic form.
    files: ["utils/flagAssets.ts", "**/*.{js,cjs,mjs}"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
);
