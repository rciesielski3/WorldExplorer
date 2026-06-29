# CODEX.md

# World Explorer - Development Standards

## Core Principles

### KISS

- Prefer the simplest working solution.
- Avoid over-engineering.
- Optimize for readability and maintainability.

### DRY

- Reuse existing hooks, services, utilities, and components.
- Extract duplicated logic immediately.

### YAGNI

- Implement only current requirements.
- Avoid speculative abstractions and unused code.

---

## TypeScript

- Use strict typing.
- Never introduce `any`.
- Prefer `interface` for data contracts.
- Type all props, API responses, and function parameters.
- Keep shared types in `/types`.

---

## Expo & React Native

### Components

- One responsibility per component.
- Keep components small and focused.
- Extract reusable UI patterns.

### Hooks

- Move reusable logic into custom hooks.
- Keep screens and components presentation-focused.

### Navigation

- Use Expo Router conventions.
- Keep route files lightweight.
- Place business logic inside feature modules.

---

## Architecture

### Preferred Structure

```text
src/
├── app/
├── features/
├── components/
├── hooks/
├── services/
├── types/
├── utils/
├── constants/
└── theme/
```

### Feature-First Approach

```text
features/
└── countries/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    └── screens/
```

---

## State Management

### Local State First

Use:

- useState
- useReducer

Use Zustand only for:

- Favorites
- Settings
- Authentication
- Global app state

---

## Data Layer

### React Query

- All server communication must use React Query.
- No direct fetch logic inside screens or components.
- Keep API logic in `/services`.

Example:

```ts
countriesService.getCountries();
newsService.getNews();
```

---

## Styling

- Use centralized theme tokens.
- No hardcoded colors or spacing values.
- Maintain consistency across all screens.

```text
theme/
├── colors.ts
├── spacing.ts
└── typography.ts
```

---

## Performance

- Measure before optimizing.
- Use memoization only when necessary.
- Keep renders predictable.
- Always configure FlatList correctly.

---

## Error Handling

Every async operation must support:

- Loading state
- Error state
- Empty state

Never leave users without feedback.

---

## Testing

Follow AAA:

```text
Arrange
Act
Assert
```

Prioritize testing:

- Business logic
- Hooks
- Services
- Critical user flows

---

## Pull Request Checklist

Before submitting:

- Code is typed.
- Code is simple.
- No duplicated logic.
- Existing patterns are respected.
- No unnecessary dependencies.
- No dead code.
- No console logs in production code.
- Feature works on Android and iOS.

---

## World Explorer Requirements

- Offline-friendly where possible.
- Reusable UI components.
- Strong TypeScript coverage.
- Consistent user experience.
- Centralized API access.
- Centralized storage access.
- Feature-based organization.

---

## Golden Rule

Write code that another developer can understand, modify, and extend quickly without additional explanation.
