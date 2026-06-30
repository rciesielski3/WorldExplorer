# State Management & Error Handling Patterns

This document defines the standardized approach to state management, prop drilling, error handling, and UI state patterns across all WorldExplorer screens.

## Philosophy

- **Keep it simple**: Use Context + useReducer for screen-level state, not Redux
- **Prop drilling limits**: Max 1-2 levels of prop drilling before using Context
- **Error-first design**: All API calls follow a standardized error handling pattern
- **Accessible loading states**: Loading, error, and empty states are always explicit
- **Reusable UI patterns**: ErrorCard, EmptyStateCard, LoadingState components handle common cases

## State Management Architecture

### Level 1: Local Component State

Use `useState` for simple, isolated state within a single component:

```tsx
// Simple toggle, input state, UI-only state
const [isExpanded, setIsExpanded] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

### Level 2: Screen-Level State with useReducer

For complex screens with related state (data, loading, error), use `useReducer` for predictable state transitions:

```tsx
// types/screens/ExploreScreen.ts
export interface ExploreState {
  countries: Country[];
  loading: boolean;
  error: ApiError | null;
  searchQuery: string;
  selectedRegion: string | null;
}

export type ExploreAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Country[] }
  | { type: 'FETCH_ERROR'; payload: ApiError }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_REGION'; payload: string | null };
```

**Reducer Implementation:**

```tsx
const initialState: ExploreState = {
  countries: [],
  loading: true,
  error: null,
  searchQuery: '',
  selectedRegion: null,
};

function exploreReducer(state: ExploreState, action: ExploreAction): ExploreState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, countries: action.payload, loading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_REGION':
      return { ...state, selectedRegion: action.payload };
    default:
      return state;
  }
}
```

**Screen Usage:**

```tsx
const ExploreScreen = ({ navigation }) => {
  const [state, dispatch] = useReducer(exploreReducer, initialState);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    loadCountries();
  }, []);

  async function loadCountries() {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await fetchCountries();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      const apiError = classifyError(error);
      dispatch({ type: 'FETCH_ERROR', payload: apiError });
    }
  }

  return (
    <View style={styles.container}>
      {state.loading && <LoadingState />}
      {state.error && (
        <ErrorCard
          error={state.error}
          onRetry={loadCountries}
          showRetryButton={state.error.retryable}
        />
      )}
      {!state.loading && state.countries.length === 0 && (
        <EmptyStateCard
          title="No countries found"
          subtitle="Try adjusting your search"
        />
      )}
      {/* Render list */}
    </View>
  );
};
```

### Level 3: Global Context (Theme, Auth)

Use React Context only for truly global state that many screens need:

- `ThemeContext` — Dark/light mode (required by all screens)
- `UserContext` — Authentication, premium status (when implemented)

Keep Context minimal—one context per concern.

## Prop Drilling Rules

| Props to Drill | Action |
|---|---|
| 0-1 levels | ✅ Fine, pass directly |
| 1-2 levels | ✅ Still acceptable, use props |
| 3+ levels | ⚠️ Use Context instead |

**Example:**

```tsx
// ❌ Bad: Drilling error 4 levels deep
<ExploreScreen
  error={error}
  setError={setError}
>
  <CountryList error={error} setError={setError}>
    <CountryRow error={error} setError={setError}>
      <CountryCard error={error} setError={setError} />
    </CountryRow>
  </CountryList>
</ExploreScreen>

// ✅ Good: Use useReducer at screen level
const ExploreScreen = () => {
  const [state, dispatch] = useReducer(exploreReducer, initialState);
  // Pass dispatch to nested components or consume state directly
  return <CountryList state={state} dispatch={dispatch} />;
};
```

## Error Handling Pattern

All API calls must follow this standardized pattern:

### 1. Define Error Types

Located in `/types/errors.ts`:

```tsx
export type ErrorType =
  | 'NETWORK'
  | 'NOT_FOUND'
  | 'INVALID_DATA'
  | 'UNAUTHORIZED'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  originalError?: Error | string;
  retryable: boolean;
  timestamp: number;
}
```

### 2. Make API Call with Try/Catch

```tsx
async function loadData() {
  dispatch({ type: 'FETCH_START' });
  try {
    const data = await api.getData();
    dispatch({ type: 'FETCH_SUCCESS', payload: data });
  } catch (error) {
    const apiError = classifyError(error);
    dispatch({ type: 'FETCH_ERROR', payload: apiError });
    // Don't show toast—let the UI component handle display
  }
}
```

### 3. Dispatch Error to State

```tsx
dispatch({ type: 'FETCH_ERROR', payload: apiError });
```

### 4. Render Error UI

```tsx
{state.error && (
  <ErrorCard
    error={state.error}
    onRetry={loadData}
    showRetryButton={state.error.retryable}
  />
)}
```

### Error Classification Reference

| Error Type | Cause | Retryable | Icon |
|---|---|---|---|
| NETWORK | No internet, timeout | ✅ Yes | wifi-off |
| NOT_FOUND | 404 response | ❌ No | file-not-found |
| INVALID_DATA | JSON parse, validation | ✅ Yes | alert-circle |
| UNAUTHORIZED | 401/403 response | ❌ No | lock |
| SERVER_ERROR | 5xx response | ✅ Yes | server-network-off |
| UNKNOWN | Unclassified | ✅ Yes | alert |

## UI State Patterns

### Loading State

```tsx
// Simple loading skeleton (if just fetching data)
{state.loading && state.countries.length === 0 && (
  <View>
    {Array.from({ length: 5 }).map((_, i) => (
      <View key={i} style={styles.skeletonRow} />
    ))}
  </View>
)}

// Optimistic UI (show existing data while refreshing)
<FlatList
  data={state.countries}
  renderItem={renderItem}
  refreshing={state.loading}
  onRefresh={refresh}
/>
```

### Error State

Always show ErrorCard instead of alert/toast for async errors:

```tsx
{state.error && (
  <ErrorCard
    error={state.error}
    onRetry={() => loadData()}
    showRetryButton={state.error.retryable}
    showDismissButton={true}
  />
)}
```

### Empty State

Show EmptyStateCard when:
- Data fetch succeeds but result is empty
- User filters result in zero items
- Data has been cleared/deleted

```tsx
{!state.loading && state.countries.length === 0 && !state.error && (
  <EmptyStateCard
    icon="map-search-outline"
    title="No Countries Found"
    subtitle="Try adjusting your search filters"
    actionLabel="Clear Filters"
    onAction={handleClearFilters}
  />
)}
```

### Complete Example: ExploreScreen State Flow

```tsx
// State machine visualization
// ┌─────────────────────┐
// │  Initial (loading)  │
// └──────────┬──────────┘
//            │ onMount: fetchCountries()
//            ▼
// ┌─────────────────────┐
// │  Fetching (LOADING) │
// └──────────┬──────────┘
//            │
//     ┌──────┴──────┐
//     ▼             ▼
// ┌────────────┐ ┌──────────────┐
// │  SUCCESS   │ │    ERROR     │
// │ (render    │ │ (show        │
// │  list)     │ │  ErrorCard)  │
// └────────────┘ └──────────────┘
```

## Design Tokens Integration

All UI components use the centralized design token system:

```tsx
// theme/tokens.ts exports:
- palette: Color definitions (bg900, indigo500, etc.)
- spacing: xs, sm, md, lg, xl, xxl
- radius: sm, md, lg, xl, full
- typography: displayLg, bodyMd, label, etc.
- darkTheme / lightTheme: Complete theme objects
```

**Using in components:**

```tsx
import { spacing, radius, typography, darkTheme, lightTheme } from '../../theme/tokens';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  text: {
    ...typography.bodyMd,
    color: isDarkMode ? darkTheme.colors.text : lightTheme.colors.text,
  },
});
```

## Best Practices

1. **Always handle errors explicitly**—Never ignore catch blocks
2. **Dispatch state changes, not direct mutations**—Use reducer actions
3. **Separate concerns**—One useReducer per screen, not app-wide
4. **Use TypeScript**—Define reducer actions and state types
5. **Show UI feedback**—Always display loading, error, or empty states
6. **Test error paths**—Mock failures to verify error UI renders
7. **Accessibility**—ErrorCard and EmptyStateCard are already accessible
8. **Haptic feedback**—Error recovery actions should trigger `Haptics.selectionAsync()`

## Screen Implementation Checklist

- [ ] Define `State` and `Action` types
- [ ] Create reducer function
- [ ] Initialize state with `useReducer`
- [ ] Wrap API calls in try/catch with `classifyError()`
- [ ] Dispatch errors to state
- [ ] Render `ErrorCard` when `state.error` exists
- [ ] Render `EmptyStateCard` when data is empty
- [ ] Show loading skeleton or indicator when `state.loading`
- [ ] Use theme context for colors
- [ ] Use design tokens for spacing/radius/typography

## Migration Path

Existing screens should be updated incrementally:

1. **Phase 1**: Add error handling pattern (try/catch + classifyError)
2. **Phase 2**: Extract simple state logic to useReducer
3. **Phase 3**: Replace manual error UI with ErrorCard
4. **Phase 4**: Add EmptyStateCard where applicable

Example: `MapScreen` → `QuizScreen` → `CountryDetailsScreen`
