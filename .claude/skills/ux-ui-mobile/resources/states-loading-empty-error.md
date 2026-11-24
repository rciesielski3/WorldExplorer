# Loading, Empty, Error, Offline States

Every screen that fetches or computes something has four states: loading, content, empty, error.
Shipping only the happy path is a defect, not a polish item.

## Completeness rule

For each data-driven view, answer in the PR description:

| State | Question | Existing building block |
|-------|----------|-------------------------|
| Loading | What does the user see in the first 300ms, and after 1s? | `ActivityIndicator` (see `screens/CountryDetailsScreen.tsx`), `ProgressBar` |
| Empty | Why is it empty and what can they do next? | `src/components/ui/EmptyStateCard.tsx` |
| Error | What failed and how do they recover? | `src/components/ui/ErrorCard.tsx`, `RetryErrorBanner.tsx`, `ErrorBoundary` |
| Offline | Does it work, degrade, or explain? | `@react-native-community/netinfo` (`useNetInfo`, used in `context/FavoritesContext.tsx`) |

## Loading

| Duration | Pattern |
|----------|---------|
| Under 300ms | No indicator; avoid a flash of spinner |
| 300ms to 1s | Small spinner or inline progress |
| 1s to 5s, known structure | Placeholder that preserves layout (skeleton) |
| Over 5s | Determinate progress or a message that says what is happening |

- `ActivityIndicator` is the only loading primitive used in the repo today; there is no skeleton
  component. Add one under `src/components/ui/` (token colors from `surfaceVariant`, `radius` tokens) only
  when a list or card layout would otherwise jump.
- Use a spinner when the shape of the result is unknown; a skeleton when it is known.
- Skeleton rules: same dimensions as the real content, `surfaceVariant` fill, subtle opacity pulse
  (about 1.2s), no pulse when Reduce Motion is on, never more than about 6 placeholder items.
- Disable the triggering control while loading and show progress inside it, so a double tap cannot fire
  twice (important for purchase and restore actions in `context/PremiumContext.tsx`).
- Keep stale content visible while refreshing; replace it only on success.
- Optimistic updates are appropriate for reversible, low-risk actions (favoriting a country). Roll back and
  tell the user when the write fails. Never for purchases.

## Empty

An empty state teaches. It has three parts: a headline, one sentence of explanation, and a next action.

```tsx
<EmptyStateCard
  icon="map-search-outline"
  title={t('explore.noResults')}
  subtitle={t('explore.noResultsHint')}
  actionLabel={t('explore.clearFilters')}
  onAction={clearFilters}
/>
```

`EmptyStateCard` props: `icon`, `title`, `subtitle`, `actionLabel`, `onAction`, `showAction`, `testID`.

| Kind | Example here | Guidance |
|------|--------------|----------|
| First use | No favorites, no quiz history | Explain the benefit and point to the action that fills it |
| No results | Search or filter in Explore | Name the cause; offer "clear filters" |
| Cleared | Everything done | Short positive confirmation; no CTA needed |
| Permission or capability off | Notifications disabled | Say what is missing and how to enable it |

Never show a bare "No data". Strings are localized in all five locale files.

## Error

Pick the pattern by type. `types/errors.ts` already classifies failures (`ApiError`, `classifyError`,
`createApiError`, `ERRORS`), so map the type to the UI rather than showing raw messages.

| Type | Pattern | Component |
|------|---------|-----------|
| Network down | Non-blocking banner with retry; keep content | `RetryErrorBanner` (`visible`, `onRetry`, `retryCount`, `maxRetries`, `isRetrying`) |
| Request failed, retryable | Inline card with retry | `ErrorCard` with `onRetry` (shown when the error is retryable) |
| Validation | Inline text under the field (`Input` has no error prop yet: render a `Text` with `theme.colors.error` and an icon), announced to TalkBack | `AccessibilityInfo.announceForAccessibility` |
| Unrecoverable render error | Full-screen fallback with a way back | `src/components/ErrorBoundary.tsx` |
| Purchase or restore failure | Say what happened and that the user was not charged (if true); offer retry and restore | Handled via `PremiumContext`; do not swallow errors silently |

Rules:

- Say what happened in plain language, then what to do. No stack traces, no "Error 500".
- Every error that can be retried has a retry action; use `useRetry` (`src/hooks/useRetry.ts`) or
  `retryWithBackoffNamed` in `utils/retry.ts` for backoff instead of re-implementing it.
- Do not use only red; pair the `error` color with an icon and text.
- Errors that appear after the user acted should be announced to screen readers.
- Log with `utils/logger.ts`; do not use an empty `catch`.

## Offline

- Decide per screen: works fully from cached/bundled data (most country data is bundled), degrades with a
  banner, or needs a connection and says so.
- Show offline status once, calmly (banner), not on every failed request.
- Queue or defer writes (favorites) and reconcile when `useNetInfo()` reports connectivity again.
- Ads and purchases need the network: hide or disable them offline rather than letting them fail loudly.
- Test with airplane mode on a device; emulators often hide offline bugs.

## Pull to refresh

Add it to lists whose content can change on the server. Do not add it to static screens or detail pages;
a gesture with no effect is confusing. Provide a non-gesture way to refresh as well (retry button).

## Anti-patterns

- Spinner forever with no timeout or error path
- Blank screen on empty or failed fetch
- Error card that only says "Something went wrong" with no action
- Skeleton that does not match the final layout (causes a jump)
- Retry that immediately re-fires without backoff and hammers the API
- Showing a toast for an error the user needs time to read or act on
- Clearing user input after a failed submit
