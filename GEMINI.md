# World Explorer - Engineering Guidelines

## Principles

### KISS

- Keep solutions simple.
- Avoid unnecessary abstractions.
- Prefer readability over clever code.

### DRY

- Extract reusable logic into hooks, utilities, or components.
- Avoid duplicated business logic.

### YAGNI

- Build only what is required today.
- Do not implement speculative features.

---

## TypeScript

- Strict mode enabled.
- Avoid `any`.
- Prefer `interface` for object contracts.
- Explicitly type API responses and component props.
- Centralize shared types in `/types`.

Example:

```ts
interface Country {
  name: string;
  capital: string;
}
```

---

## Expo & React Native

### Components

- Single Responsibility Principle.
- Keep components focused and small.
- Extract reusable UI into shared components.

### Hooks

- Move reusable logic to custom hooks.
- Keep screens focused on presentation.

Example:

```ts
useCountries();
useFavorites();
useQuiz();
```

### Navigation

- Use Expo Router.
- Keep route files thin.
- Move business logic to feature modules.

---

## State Management

### Local First

- Prefer `useState`.
- Use Zustand only for shared/global state.

Examples:

- Theme
- Favorites
- User settings

---

## Data Fetching

- Use React Query for all API communication.
- Never fetch directly inside UI components.
- Centralize API calls in `/services`.

Example:

```ts
const { data } = useQuery(...);
```

---

## Styling

- Use centralized theme values.
- No hardcoded colors or spacing.
- Reuse design tokens.

Structure:

```text
theme/
  colors.ts
  spacing.ts
  typography.ts
```

---

## Performance

- Optimize only when needed.
- Use `memo`, `useMemo`, and `useCallback` selectively.
- Always provide `keyExtractor` for FlatList.

---

## Project Structure

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

Feature-first organization preferred.

---

## Error Handling

Always handle:

- Loading
- Error
- Empty state

Example:

```tsx
if (isLoading) return <Loading />;
if (error) return <ErrorState />;
if (!data?.length) return <EmptyState />;
```

---

## Testing

Follow AAA pattern:

```text
Arrange
Act
Assert
```

Prioritize:

- Services
- Hooks
- Business logic
- Critical user flows

---

## Code Review Checklist

Before merging:

- Is it simple?
- Is it reusable?
- Is it typed?
- Is it testable?
- Is it easy to maintain?
- Can it be understood in under 5 minutes?

---

## World Explorer Rules

- Feature-first architecture.
- Offline-friendly whenever possible.
- Strong typing across the app.
- Reusable UI components.
- Centralized API and storage logic.
- Consistent UX across all screens.

## Golden Rule

Write code that is:

- Simple
- Maintainable
- Testable
- Scalable

Prefer clarity over complexity.
