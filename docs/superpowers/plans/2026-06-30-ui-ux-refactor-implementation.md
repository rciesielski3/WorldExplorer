# WorldExplorer UI/UX Refactor — Implementation Plan (REVISED)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform WorldExplorer from a student app aesthetic to a professional, exploration-themed interface using Material Design 3 with playful interactions across all 6 screens.

**Architecture:** Pre-flight validation (assets, layout), then phased implementation starting with design tokens and atomic components (a/11y-first), state management layer, navigation system, then screen-by-screen refactor. All components use design tokens (no hardcoded colors), support light/dark modes with persistence, handle errors/empty states, and include playful animations.

**Tech Stack:** React Native 0.79, Expo 53, TypeScript 5.8, react-native-reanimated 3.17, expo-haptics 14.1, expo-linear-gradient 14.1, lottie-react-native 7.2, React Navigation 7.x, AsyncStorage (theme persistence)

## Global Constraints

- Material Design 3 foundation with rounded corners (12-16dp), elevation, ripple effects
- Color palette: Sky Blue (#1E88E5), Earth Green (#43A047), Ocean Blue (#0277BD), White/Dark Gray surfaces
- Light & dark mode: Automatic adaptive colors with user preference persistence (AsyncStorage)
- All components: TypeScript typed, reusable, use design tokens (theme/tokens.ts), semantic a/11y labels from creation
- Animations: 200-500ms durations, GPU-accelerated (react-native-reanimated), respects prefersReducedMotion
- Accessibility: WCAG AA contrast ratios (≥4.5:1), 48dp touch targets, semantic labels for screen readers, integrated into Phase 1
- Performance: 60fps target on mid-range devices (Galaxy S9+, iPhone XS), all animations GPU-accelerated, Lottie lazy-loaded
- Error handling: All screens handle API errors, loading states, empty states with UI patterns
- State management: Context + useReducer for complex screens (no prop drilling between 3+ levels)
- Haptic feedback: Pair with touch interactions using expo-haptics (Medium/Light/Subtle)
- Navigation: Floating bottom nav (56dp, 5 icons) + top bar on all screens (layout validated before code)
- Portfolio quality: Clean code, TypeScript strict mode, no console.logs, frequent commits, accessibility from day 1

---

## Pre-Flight Phase: Assets & Layout Validation

### Task 0A: Source & Validate Lottie Animations

**Files:**
- Create: `src/assets/animations/` directory
- Create: `LOTTIE_SOURCES.md` (documentation of animation sources)

**Steps:**

- [ ] **Step 1: Identify animation requirements**

From design spec, we need:
1. `rotating-earth.json` — 6s loop, globe rotation for hero (HomeScreen)
2. `confetti.json` — 2s one-shot, celebration on quiz complete
3. `spinner.json` — continuous, loading state indicator
4. `achievement.json` — 2s one-shot, badge pop with bounce

- [ ] **Step 2: Source animations from LottieFiles.com**

Go to https://lottiefiles.com and download free animations:
- Search "rotating globe" → Find one that matches specs, download JSON
- Search "confetti" → Download
- Search "loading spinner" → Download
- Search "achievement badge" or "popup" → Download

License check: Ensure animations are free/MIT licensed (most on LottieFiles are).

- [ ] **Step 3: Test animations in Expo**

Create temp test screen:
```typescript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('../assets/animations/rotating-earth.json')}
  autoPlay
  loop
  style={{ width: 140, height: 140 }}
/>
```

Run: `npm start` → Load animation → Verify smooth playback (no stuttering), correct duration

- [ ] **Step 4: Document animation sources**

Create `LOTTIE_SOURCES.md`:
```markdown
# Lottie Animation Sources

## rotating-earth.json
- Source: LottieFiles
- URL: [link to download]
- License: Free / MIT
- Duration: 6s
- Loop: Yes
- File size: X KB

## confetti.json
...

## spinner.json
...

## achievement.json
...

**Attribution:** All animations sourced from LottieFiles.com (free tier)
```

- [ ] **Step 5: Commit**

```bash
git add src/assets/animations/ LOTTIE_SOURCES.md
git commit -m "feat: add Lottie animation assets

- rotating-earth: 6s loop for hero section
- confetti: 2s celebration animation
- spinner: continuous loading indicator
- achievement: 2s badge pop animation
- All sourced from LottieFiles.com with MIT license
- Tested smooth playback in Expo"
```

---

### Task 0B: Validate Navigation Layout (Top Bar + Floating Nav)

**Files:**
- Create: `docs/navigation-layout.md` (quick reference, not full design doc)

**Steps:**

- [ ] **Step 1: Create quick wireframe/reference**

Document in `docs/navigation-layout.md`:

```markdown
# Navigation Layout Reference

## Layout Structure

```
┌─────────────────────────┐
│  Status Bar (system)    │ ← Safe area
├─────────────────────────┤
│ TopBar (56dp)           │ ← App name or screen title + settings
├─────────────────────────┤
│                         │
│  Screen Content         │ ← Scrollable, accounts for safe areas
│  (scrollable)           │
│                         │ ← Bottom safe area (home indicator, notch)
├─────────────────────────┤
│ FloatingNavBar (56dp)   │ ← Fixed 16dp above bottom + safe area
│ (5 icons)               │
└─────────────────────────┘
```

## Screen-Specific Notes

**MapScreen:** Floating nav positioned over map. Map has padding-bottom: 80dp to avoid obstruction.
**ExploreScreen:** Grid scrolls behind nav, nav hides/shows on scroll (threshold: 50dp).
**QuizScreen:** Nav visible always, progress bar at top.

## Safe Area Handling

- Top inset: TopBar respects status bar + notch
- Bottom inset: FloatingNavBar respects home indicator + notch
- Content: ScrollView has useSafeAreaInsets() margins

## Validation Checklist

- [ ] TopBar + FloatingNav don't visually conflict
- [ ] Floating nav doesn't obscure interactive content
- [ ] MapScreen map clickable above floating nav
- [ ] Notched devices: content not cut off
```

- [ ] **Step 2: Test layout on multiple devices**

Run: `npm start`
- iPhone SE (small, no notch)
- iPhone 14 Pro (medium, notch)
- iPad (tablet, safe area larger)

Visual check:
- TopBar visible, readable
- FloatingNav positioned correctly at bottom
- No visual overlaps
- Content scrolls properly behind nav

- [ ] **Step 3: Test on real device (if available)**

If you have an Android device:
- Run on Galaxy S9+ or similar (mid-range)
- Verify layout, safe areas work

- [ ] **Step 4: Commit**

```bash
git add docs/navigation-layout.md
git commit -m "docs: add navigation layout reference and validation

- Layout diagram showing TopBar + FloatingNav coexistence
- Screen-specific notes (MapScreen, ExploreScreen, QuizScreen)
- Safe area handling for notched devices
- Validation checklist for visual conflicts"
```

---

### Task 0C: Define State Management & Error Handling Patterns

**Files:**
- Create: `docs/state-management.md`
- Create: `src/types/errors.ts`

**Steps:**

- [ ] **Step 1: Document state management approach**

Create `docs/state-management.md`:

```markdown
# State Management Strategy

## Approach: Context + useReducer (no Redux)

**Why:** App is mid-complexity (6 screens), doesn't need Redux. Context + reducer is sufficient.

## Screen-Level State (useReducer)

- **ExploreScreen:** selectedRegion, searchQuery, filteredCountries, loading, error
- **QuizScreen:** currentQuestion, userAnswers, score, loading
- **MapScreen:** visibleRegions, selectedCountry, zoomLevel

Each screen has its own reducer with actions:
```typescript
type ExploreAction =
  | { type: 'SET_REGION'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
```

## Global State (Context)

- **ThemeContext:** isDarkMode, toggleTheme
- **AuthContext (if needed):** currentUser, loginState

## Prop Drilling Rule

- 1-2 levels deep: Prop drill
- 3+ levels: Use Context
- Example: HomeScreen → DailyCard → CountryInfo → Badge
  → Prop drill (3 levels OK for simple data)

## Error Handling Pattern (all screens)

Every API call follows this pattern:

```typescript
const [state, dispatch] = useReducer(reducer, initialState);

const loadData = async () => {
  dispatch({ type: 'SET_LOADING', payload: true });
  try {
    const data = await api.fetch(...);
    dispatch({ type: 'SET_DATA', payload: data });
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: error.message });
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};
```

## UI Patterns (for error/loading/empty)

**Loading State:**
```typescript
{state.loading && <SkeletonLoader />}
{!state.loading && state.data && <DataView />}
```

**Error State:**
```typescript
{state.error && (
  <ErrorCard
    message={state.error}
    onRetry={loadData}
  />
)}
```

**Empty State:**
```typescript
{!state.loading && state.data?.length === 0 && (
  <EmptyStateCard message="No countries match your search" />
)}
```
```

- [ ] **Step 2: Create error types**

`src/types/errors.ts`:

```typescript
export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

export const ERRORS = {
  NETWORK: { code: 'NETWORK_ERROR', message: 'Network error. Check connection.', retryable: true },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found.', retryable: false },
  INVALID_DATA: { code: 'INVALID_DATA', message: 'Invalid data format.', retryable: false },
  UNKNOWN: { code: 'UNKNOWN', message: 'Something went wrong.', retryable: true },
};
```

- [ ] **Step 3: Create ErrorCard & EmptyStateCard components**

Add to `src/components/ui/`:

```typescript
// src/components/ui/ErrorCard.tsx
export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { theme } = useTheme();
  return (
    <Card style={{ backgroundColor: theme.colors.error + '15' }}>
      <MaterialCommunityIcons name="alert-circle" size={32} color={theme.colors.error} />
      <Text style={{ color: theme.colors.error, marginVertical: theme.spacing.md }}>
        {message}
      </Text>
      <Button label="Retry" onPress={onRetry} />
    </Card>
  );
}

// src/components/ui/EmptyStateCard.tsx
export function EmptyStateCard({ message }: { message: string }) {
  const { theme } = useTheme();
  return (
    <Card style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
      <MaterialCommunityIcons name="inbox-multiple" size={48} color={theme.colors.textSecondary} />
      <Text style={{ marginTop: theme.spacing.md, color: theme.colors.textSecondary }}>
        {message}
      </Text>
    </Card>
  );
}
```

- [ ] **Step 4: Test error patterns**

Create temp test component with dummy API call:
```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const simulateError = () => {
  setError('Failed to load data');
};

return (
  <>
    {loading && <Text>Loading...</Text>}
    {error && <ErrorCard message={error} onRetry={simulateError} />}
    <Button label="Trigger Error" onPress={simulateError} />
  </>
);
```

- [ ] **Step 5: Commit**

```bash
git add docs/state-management.md src/types/errors.ts src/components/ui/ErrorCard.tsx src/components/ui/EmptyStateCard.tsx
git commit -m "docs: add state management strategy and error handling patterns

- Context + useReducer for screen-level state
- Prop drilling rules (no Redux)
- Error/loading/empty state UI patterns
- ErrorCard and EmptyStateCard components
- ApiError types for consistent error handling"
```

---

## Phase 1: Foundation (Updated)

### Task 1: Create Design Tokens System with Theme Persistence

**Files:**
- Create: `src/theme/tokens.ts`
- Modify: `src/theme/ThemeContext.tsx` (if exists, else create)
- Install: `@react-native-async-storage/async-storage` (for persistence)

**Interfaces:**
- Produces: `lightTheme` and `darkTheme` objects with colors, spacing, typography, shadows
- ThemeContext provides: `isDarkMode`, `toggleTheme`, `themeLoading`

**Steps:**

- [ ] **Step 0: Install AsyncStorage**

Run: `npm install @react-native-async-storage/async-storage`

- [ ] **Step 1: Create tokens.ts**

```typescript
// src/theme/tokens.ts
export const commonTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    fontFamily: 'Exo2-Regular',
    sizes: {
      display: 32,
      headline: 28,
      title: 20,
      subtitle: 16,
      body: 14,
      label: 12,
      caption: 11,
    },
    weights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.5,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const lightTheme = {
  ...commonTokens,
  colors: {
    primary: '#1E88E5',      // Sky Blue
    secondary: '#43A047',    // Earth Green
    accent: '#0277BD',       // Ocean Blue
    success: '#2E7D32',
    error: '#C62828',
    warning: '#F57C00',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    text: '#212121',
    textSecondary: '#666666',
    textDisabled: 'rgba(33, 33, 33, 0.6)',
    border: '#E0E0E0',
  },
  gradients: {
    home: ['#1E88E5', '#FFFFFF'],
    explore: ['#43A047', '#FFFFFF'],
    map: ['#0277BD', '#E3F2FD'],
  },
};

export const darkTheme = {
  ...commonTokens,
  colors: {
    primary: '#64B5F6',      // Sky Blue (light)
    secondary: '#81C784',    // Earth Green (light)
    accent: '#4FC3F7',       // Ocean Blue (light)
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    surface: '#121212',
    surfaceVariant: '#1E1E1E',
    text: '#E0E0E0',
    textSecondary: '#B0B0B0',
    textDisabled: 'rgba(224, 224, 224, 0.6)',
    border: '#424242',
  },
  gradients: {
    home: ['#0D47A1', '#1E1E1E'],
    explore: ['#1B5E20', '#1E1E1E'],
    map: ['#01579B', '#1E1E1E'],
  },
};

export type Theme = typeof lightTheme;
```

- [ ] **Step 2: Create/Update ThemeContext.tsx with AsyncStorage**

```typescript
// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './tokens';

interface ThemeContextType {
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLoading: boolean; // Prevents flashing wrong theme on startup
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'app_theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  // On mount: load saved preference, then detect system
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved) {
          setIsDarkMode(saved === 'dark');
        } else {
          // Fall back to system preference
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setIsDarkMode(systemColorScheme === 'dark');
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // On system preference change: only update if user hasn't set custom preference
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.getItem(THEME_KEY).then((saved) => {
        if (!saved && systemColorScheme) {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      });
    }
  }, [systemColorScheme, isLoading]);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Don't render until theme is loaded (prevents flash)
  if (isLoading) {
    return null; // Or splash screen if preferred
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

- [ ] **Step 3: Update App.tsx to wrap with ThemeProvider**

```typescript
// src/App.tsx (add this to existing structure)
import { ThemeProvider } from './theme/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* existing navigation and screens */}
    </ThemeProvider>
  );
}
```

- [ ] **Step 4: Verify tokens are accessible**

Run: `npm start` → Open app in Expo Go → No errors in console

- [ ] **Step 5: Commit**

```bash
git add src/theme/tokens.ts src/theme/ThemeContext.tsx src/App.tsx
git commit -m "feat: add design tokens system and theme context

- Create centralized tokens (spacing, typography, shadows, colors)
- Implement ThemeContext for light/dark mode switching
- Support system color scheme detection
- All colors use design tokens (no hardcoded values)"
```

---

### Task 2: Create Atomic Component Library — Part 1 (Button, Card, Badge) with A/11y

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`

**Interfaces:**
- Consumes: `useTheme()`, design tokens from tokens.ts
- Produces: 
  - `Button` props: `variant: 'filled' | 'outlined' | 'text'`, `onPress`, `label`, `disabled`, `accessibilityLabel` (optional, defaults to label)
  - `Card` props: `children`, `onPress`, `style`, `elevation`, `accessibilityLabel` (if interactive)
  - `Badge` props: `label`, `icon`, `variant`, `accessibilityLabel`

**A/11y Checklist (all components):**
- ✅ 4.5:1 contrast ratio verified for all colors
- ✅ Semantic labels on all interactive elements
- ✅ 48dp minimum touch targets
- ✅ Respects prefersReducedMotion setting

**Steps:**

- [ ] **Step 1: Create Button.tsx with A/11y**

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import { Pressable, Text, ViewStyle, AccessibilityRole } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string; // A/11y: defaults to label if not provided
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStyles = () => {
    const baseStyle: ViewStyle = {
      height: 48,
      minWidth: 48, // A/11y: minimum touch target
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };

    switch (variant) {
      case 'outlined':
        return [
          baseStyle,
          {
            borderWidth: 2,
            borderColor: disabled ? theme.colors.textDisabled : theme.colors.secondary,
          },
        ];
      case 'text':
        return [baseStyle, { paddingHorizontal: theme.spacing.md }];
      default: // filled
        return [
          baseStyle,
          {
            backgroundColor: disabled ? theme.colors.textDisabled : theme.colors.primary,
          },
        ];
    }
  };

  const getTextColor = () => {
    if (variant === 'filled') return '#FFFFFF';
    if (variant === 'outlined') return disabled ? theme.colors.textDisabled : theme.colors.secondary;
    return theme.colors.primary;
  };

  return (
    <Animated.View entering={FadeIn} style={style}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => { scale.value = withSpring(1.02); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        <Animated.View style={[getStyles(), animatedStyle]}>
          <Text
            style={{
              color: getTextColor(),
              fontSize: theme.typography.sizes.label,
              fontWeight: theme.typography.weights.medium,
            }}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
```

- [ ] **Step 2: Create Card.tsx**

```typescript
// src/components/ui/Card.tsx
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg';
}

export function Card({ children, onPress, style, elevation = 'sm' }: CardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const shadow = useSharedValue(theme.shadows[elevation].elevation);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(1.02);
    shadow.value = withSpring(8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    shadow.value = withSpring(theme.shadows[elevation].elevation);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
    >
      <Animated.View
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            ...theme.shadows[elevation],
          },
          animatedStyle,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

- [ ] **Step 3: Create Badge.tsx**

```typescript
// src/components/ui/Badge.tsx
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import { useTheme } from '../../theme/ThemeContext';

interface BadgeProps {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
}

export function Badge({ label, icon, variant = 'primary' }: BadgeProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Animated.View
      entering={ZoomIn.springify()}
      style={{
        backgroundColor: getBackgroundColor(),
        borderRadius: 20,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        alignSelf: 'flex-start',
        ...theme.shadows.sm,
      }}
    >
      {icon && (
        <MaterialCommunityIcons name={icon} size={12} color="#FFFFFF" />
      )}
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: theme.typography.sizes.caption,
          fontWeight: theme.typography.weights.medium,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
```

- [ ] **Step 4: Test components in Expo**

Create a test screen or use existing screen to verify:
- Button variants render correctly
- Card responds to press with animation
- Badge displays with icon

Run: `npm start` → Navigate to test location → Verify visual appearance and interactions

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/Card.tsx src/components/ui/Badge.tsx
git commit -m "feat: add atomic UI components (Button, Card, Badge)

- Button with filled/outlined/text variants, haptic feedback, ripple effect
- Card with scale animation on press, elevation levels
- Badge with icon support, color variants, zoom animation
- All use design tokens and theme context"
```

---

### Task 3: Create Atomic Component Library — Part 2 (Input, ToggleSwitch, Progress)

**Files:**
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/ToggleSwitch.tsx`
- Create: `src/components/ui/ProgressBar.tsx`

**Interfaces:**
- Consumes: `useTheme()`, design tokens
- Produces: 
  - `Input` props: `placeholder`, `value`, `onChangeText`, `icon`, `disabled`
  - `ToggleSwitch` props: `value`, `onToggle`, `label`
  - `ProgressBar` props: `progress` (0-1), `color`

**Steps:**

- [ ] **Step 1: Create Input.tsx with KeyboardAvoidingView & A/11y**

```typescript
// src/components/ui/Input.tsx
import React, { useState } from 'react';
import { TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import { useTheme } from '../../theme/ThemeContext';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  disabled?: boolean;
  label?: string; // A/11y: semantic label
  accessibilityHint?: string;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  icon,
  disabled = false,
  label,
  accessibilityHint,
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 48,
          minHeight: 48, // A/11y: touch target
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surfaceVariant,
          paddingHorizontal: theme.spacing.md,
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
        }}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            style={{ marginRight: theme.spacing.sm }}
          />
        )}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          placeholderTextColor={theme.colors.textSecondary}
          accessibilityLabel={label || placeholder}
          accessibilityHint={accessibilityHint}
          accessibilityRole="search" // if search field
          style={{
            flex: 1,
            color: theme.colors.text,
            fontSize: theme.typography.sizes.body,
            fontFamily: theme.typography.fontFamily,
            minHeight: 48,
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
```

- [ ] **Step 2: Create ToggleSwitch.tsx**

```typescript
// src/components/ui/ToggleSwitch.tsx
import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';

interface ToggleSwitchProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
}

export function ToggleSwitch({ value, onToggle, label }: ToggleSwitchProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(value ? 24 : 0);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !value;
    onToggle(newValue);
    translateX.value = withSpring(newValue ? 24 : 0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
      {label && (
        <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.body }}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={handleToggle}
        style={{
          width: 56,
          height: 32,
          borderRadius: 16,
          backgroundColor: value ? theme.colors.primary : theme.colors.surfaceVariant,
          justifyContent: 'center',
          paddingLeft: theme.spacing.xs,
          ...theme.shadows.sm,
        }}
      >
        <Animated.View
          style={[
            {
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
            },
            animatedStyle,
          ]}
        >
          <MaterialCommunityIcons
            name={value ? 'moon' : 'white-balance-sunny'}
            size={16}
            color={theme.colors.primary}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 3: Create ProgressBar.tsx**

```typescript
// src/components/ui/ProgressBar.tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  const { theme } = useTheme();
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress * 100, { duration: 300 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View
      style={{
        width: '100%',
        height: 4,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: color || theme.colors.primary,
            borderRadius: theme.borderRadius.sm,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
```

- [ ] **Step 4: Test in Expo**

Run: `npm start` → Verify inputs render, toggle switches work, progress bar animates

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Input.tsx src/components/ui/ToggleSwitch.tsx src/components/ui/ProgressBar.tsx
git commit -m "feat: add form and feedback UI components

- Input field with icon support, focus animation, disabled state
- ToggleSwitch with sun/moon icons, haptic feedback, smooth animation
- ProgressBar with animated fill, customizable color
- All themed and accessible"
```

---

## Phase 2: Navigation System

### Task 4: Create Top Bar Component

**Files:**
- Create: `src/components/Navigation/TopBar.tsx`

**Interfaces:**
- Consumes: `useTheme()`, React Navigation
- Produces: `TopBar` props: `title`, `onSettingsPress`, `showBack`, `onBackPress`, `rightAction`

**Steps:**

- [ ] **Step 1: Create TopBar.tsx**

```typescript
// src/components/Navigation/TopBar.tsx
import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';

interface TopBarProps {
  title?: string;
  showAppName?: boolean;
  onSettingsPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  gradientColors?: [string, string];
}

export function TopBar({
  title,
  showAppName = false,
  onSettingsPress,
  showBack = false,
  onBackPress,
  gradientColors,
}: TopBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettingsPress?.();
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBackPress?.();
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        height: 56 + insets.top,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: gradientColors ? undefined : theme.colors.surface,
      }}
    >
      {/* Left Content */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <Pressable onPress={handleBackPress} style={{ marginRight: theme.spacing.md }}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        )}
        <Text
          style={{
            fontSize: showAppName ? theme.typography.sizes.title : theme.typography.sizes.subtitle,
            fontWeight: showAppName ? theme.typography.weights.bold : theme.typography.weights.medium,
            color: showAppName ? theme.colors.primary : theme.colors.text,
          }}
        >
          {showAppName ? 'WorldExplorer' : title}
        </Text>
      </View>

      {/* Right Content */}
      {onSettingsPress && (
        <Pressable onPress={handleSettingsPress} hitSlop={8}>
          <MaterialCommunityIcons
            name="cog"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Export from component index**

Add to `src/components/Navigation/index.ts` (create if doesn't exist):

```typescript
export { TopBar } from './TopBar';
```

- [ ] **Step 3: Test in Expo**

Run: `npm start` → Verify top bar renders on a screen

- [ ] **Step 4: Commit**

```bash
git add src/components/Navigation/TopBar.tsx src/components/Navigation/index.ts
git commit -m "feat: add TopBar navigation component

- App name or screen title display
- Back button with haptic feedback
- Settings icon access point
- Respects safe area (notch, status bar)"
```

---

### Task 5: Create Floating Navigation Bar

**Files:**
- Create: `src/components/Navigation/FloatingNavBar.tsx`
- Create: `src/components/Navigation/NavBarIcon.tsx`

**Interfaces:**
- Consumes: React Navigation, `useTheme()`, route names
- Produces: Navigation state integration

**Steps:**

- [ ] **Step 1: Create NavBarIcon.tsx**

```typescript
// src/components/Navigation/NavBarIcon.tsx
import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';

interface NavBarIconProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
  color: string;
}

export function NavBarIcon({ name, isActive, onPress, color }: NavBarIconProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={{ flex: 1, alignItems: 'center', padding: theme.spacing.sm }}>
      <MaterialCommunityIcons
        name={name}
        size={24}
        color={isActive ? color : theme.colors.textSecondary}
        style={{ fontWeight: isActive ? '700' : '400' }}
      />
    </Pressable>
  );
}
```

- [ ] **Step 2: Create FloatingNavBar.tsx**

```typescript
// src/components/Navigation/FloatingNavBar.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { NavBarIcon } from './NavBarIcon';

interface NavItem {
  name: string;
  icon: string;
  color: string;
}

interface FloatingNavBarProps {
  currentRoute: string;
  onNavigate: (routeName: string) => void;
  items: NavItem[];
}

export function FloatingNavBar({ currentRoute, onNavigate, items }: FloatingNavBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const [lastScrollY, setLastScrollY] = useState(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: insets.bottom + 16,
          left: 24,
          right: 24,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          ...theme.shadows.lg,
        },
        animatedStyle,
      ]}
    >
      {items.map((item) => (
        <NavBarIcon
          key={item.name}
          name={item.icon}
          isActive={currentRoute === item.name}
          onPress={() => onNavigate(item.name)}
          color={item.color}
        />
      ))}
    </Animated.View>
  );
}
```

- [ ] **Step 3: Integration with existing navigation**

Modify `src/App.tsx` or main navigator to include FloatingNavBar:

```typescript
// Add to your navigation structure
<FloatingNavBar
  currentRoute={currentRoute}
  onNavigate={handleNavigation}
  items={[
    { name: 'Home', icon: 'home', color: theme.colors.primary },
    { name: 'Explore', icon: 'globe', color: theme.colors.secondary },
    { name: 'Map', icon: 'map-marker', color: theme.colors.accent },
    { name: 'Quiz', icon: 'brain', color: theme.colors.primary },
    { name: 'Settings', icon: 'cog', color: theme.colors.textSecondary },
  ]}
/>
```

- [ ] **Step 4: Test floating nav in Expo**

Run: `npm start` → Navigate between screens → Verify floating nav updates correctly

- [ ] **Step 5: Commit**

```bash
git add src/components/Navigation/FloatingNavBar.tsx src/components/Navigation/NavBarIcon.tsx
git commit -m "feat: add floating navigation bar system

- Floating bottom nav with 5 icon buttons
- Active state highlighting with theme colors
- Haptic feedback on tap
- Respects safe area for notch/home indicator
- Frosted glass style background"
```

---

## Phase 3: Screen Refactors (One screen per task, fully independent)

### Task 6: Refactor HomeScreen

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

**Interfaces:**
- Consumes: `TopBar`, `Card`, `Button`, `Badge`, design tokens
- Produces: Updated HomeScreen with hero, daily card, stats, CTAs

**Steps:**

- [ ] **Step 1: Create hero section with earth globe animation**

Add to HomeScreen:

```typescript
import LottieView from 'lottie-react-native';
import LinearGradient from 'expo-linear-gradient';

// In HomeScreen component render:
<LinearGradient
  colors={theme.gradients.home}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}
>
  <LottieView
    source={require('../../assets/animations/rotating-earth.json')}
    autoPlay
    loop
    style={{ width: 140, height: 140 }}
  />
  <Text style={{ marginTop: theme.spacing.md, fontSize: 16, color: theme.colors.secondary }}>
    Discover Every Corner of the World
  </Text>
</LinearGradient>
```

- [ ] **Step 2: Add stats cards section**

```typescript
<View style={{ flexDirection: 'row', marginHorizontal: theme.spacing.md, gap: theme.spacing.md }}>
  <StatCard label="Explored" value="42" />
  <StatCard label="Streak" value="7" />
  <StatCard label="Regions" value="5" />
</View>
```

- [ ] **Step 3: Add daily challenge card**

```typescript
<Card style={{ marginHorizontal: theme.spacing.md, marginVertical: theme.spacing.lg }}>
  {/* Daily country card content */}
</Card>
```

- [ ] **Step 4: Add CTAs (Explore, Quiz buttons)**

```typescript
<View style={{ paddingHorizontal: theme.spacing.md, gap: theme.spacing.md }}>
  <Button label="Explore Now" onPress={() => navigate('Explore')} />
  <Button label="Take Quiz" onPress={() => navigate('Quiz')} variant="outlined" />
</View>
```

- [ ] **Step 5: Test HomeScreen**

Run: `npm start` → Navigate to HomeScreen → Verify hero, stats, daily card, buttons display

- [ ] **Step 6: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "refactor: redesign HomeScreen with Material Design 3

- Hero section with gradient background and rotating globe animation
- Daily challenge card with playful animations
- Quick stats display
- CTA buttons (Explore, Quiz)
- Full theme integration"
```

---

### Task 7: Refactor ExploreScreen

**Files:**
- Modify: `src/screens/ExploreScreen.tsx`
- Create: `src/components/CountryCard.tsx` (shared with other screens)

**Steps:**

- [ ] **Step 1: Update ExploreScreen layout**

```typescript
// Header with search + filters
<TopBar title="Explore" showAppName={false} />
<Input placeholder="Search countries..." icon="magnify" />

// Region filter chips (horizontal scroll)
<FlatList
  horizontal
  data={regions}
  renderItem={({ item }) => (
    <Pressable
      onPress={() => setSelectedRegion(item)}
      style={{
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: 20,
        backgroundColor: selectedRegion === item ? theme.colors.primary : theme.colors.surfaceVariant,
      }}
    >
      <Text>{item}</Text>
    </Pressable>
  )}
/>

// Country grid (2 columns)
<FlatList
  numColumns={2}
  data={countries}
  renderItem={({ item }) => <CountryCard country={item} />}
/>
```

- [ ] **Step 2: Create CountryCard component**

```typescript
// src/components/CountryCard.tsx
import { Card, Badge } from './ui';
import { useTheme } from '../theme/ThemeContext';

export function CountryCard({ country, onPress }) {
  const { theme } = useTheme();
  return (
    <Card onPress={onPress}>
      <Image source={{ uri: country.flagUrl }} style={{ height: 120, borderRadius: 12 }} />
      <Text style={{ marginTop: theme.spacing.md, fontWeight: 'bold' }}>
        {country.name}
      </Text>
      <Badge label={country.region} variant="secondary" />
    </Card>
  );
}
```

- [ ] **Step 3: Test ExploreScreen**

Run: `npm start` → Navigate to ExploreScreen → Search, filter by region, tap card

- [ ] **Step 4: Commit**

```bash
git add src/screens/ExploreScreen.tsx src/components/CountryCard.tsx
git commit -m "refactor: redesign ExploreScreen

- Search bar with animated focus
- Region filter chips with smooth transitions
- 2-column country grid with CountryCard component
- Flag images and region badges
- Material Design 3 + earth-green gradient"
```

---

### Task 8: Refactor CountryDetailsScreen

**Files:**
- Modify: `src/screens/CountryDetailsScreen.tsx`

**Steps:**

- [ ] **Step 1: Update CountryDetailsScreen layout**

```typescript
<TopBar title="" showBack onBackPress={navigation.goBack} />

<ScrollView>
  {/* Hero image with gradient overlay */}
  <Image source={{ uri: country.flag }} style={{ height: 200 }} />
  
  {/* Header section */}
  <Card style={{ marginHorizontal: theme.spacing.md }}>
    <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{country.name}</Text>
    <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>
      {country.capital}
    </Text>
    <Badge label={country.region} icon="map" />
  </Card>

  {/* Info sections */}
  <View style={{ paddingHorizontal: theme.spacing.md, gap: theme.spacing.md }}>
    <InfoCard label="Population" value={country.population} />
    <InfoCard label="Area" value={country.area} />
    <InfoCard label="Languages" value={country.languages.join(', ')} />
  </View>

  {/* Fun fact */}
  <Card style={{ margin: theme.spacing.md, backgroundColor: theme.colors.warning + '15' }}>
    <MaterialCommunityIcons name="lightbulb" size={24} color={theme.colors.warning} />
    <Text style={{ marginTop: theme.spacing.sm }}>{country.funFact}</Text>
  </Card>

  {/* Mini map */}
  <View style={{ height: 200, margin: theme.spacing.md }}>
    <MapView region={country.coordinates} />
  </View>

  {/* Quiz CTA */}
  <Button label="Test Your Knowledge" onPress={() => navigate('Quiz')} style={{ margin: theme.spacing.md }} />
</ScrollView>
```

- [ ] **Step 2: Create InfoCard component** (reusable for details)

```typescript
// src/components/InfoCard.tsx
export function InfoCard({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <Card>
      <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: theme.spacing.xs }}>
        {value}
      </Text>
    </Card>
  );
}
```

- [ ] **Step 3: Test CountryDetailsScreen**

Run: `npm start` → Navigate Explore → Tap a country → View all details

- [ ] **Step 4: Commit**

```bash
git add src/screens/CountryDetailsScreen.tsx src/components/InfoCard.tsx
git commit -m "refactor: redesign CountryDetailsScreen

- Hero image with gradient overlay
- Country header (name, capital, region badge)
- Info cards (population, area, languages)
- Fun fact section with icon
- Mini map view
- Quiz CTA button
- Material Design 3 card-based layout"
```

---

### Task 9: Refactor MapScreen

**Files:**
- Modify: `src/screens/MapScreen.tsx`

**Steps:**

- [ ] **Step 1: Update MapScreen**

**Files:**
- Modify: `src/screens/MapScreen.tsx`
- Modify: `src/screens/QuizScreen.tsx`

**Steps:**

- [ ] **Step 1: Update MapScreen**

```typescript
<TopBar title="World Map" />
<MapView style={{ flex: 1 }}>
  {/* Existing map logic */}
</MapView>
// Floating action buttons (zoom, filter, reset)
<View style={{ position: 'absolute', right: 16, bottom: 80 }}>
  <Button icon="plus" onPress={handleZoomIn} />
  <Button icon="minus" onPress={handleZoomOut} />
  <Button icon="home" onPress={handleReset} />
</View>
```

- [ ] **Step 2: Update QuizScreen layout**

```typescript
<TopBar title="Quiz" />
<ProgressBar progress={currentQuestion / totalQuestions} />

<Card style={{ margin: theme.spacing.lg }}>
  <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
    {question.text}
  </Text>
  <Badge label={question.difficulty} variant="warning" />
</Card>

<View style={{ paddingHorizontal: theme.spacing.md, gap: theme.spacing.md }}>
  {question.answers.map((answer) => (
    <Pressable
      key={answer.id}
      onPress={() => handleAnswer(answer)}
      style={{
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
      }}
    >
      <Text>{answer.text}</Text>
    </Pressable>
  ))}
</View>

<Button label="Next Question" onPress={handleNext} />
```

- [ ] **Step 3: Test both screens**

Run: `npm start` → MapScreen interaction → QuizScreen flow

- [ ] **Step 4: Commit**

```bash
git add src/screens/MapScreen.tsx src/screens/QuizScreen.tsx
git commit -m "refactor: redesign Map and Quiz screens

- MapScreen with floating action buttons for zoom/filter/reset
- Minimal UI overlay for map interaction
- QuizScreen with animated progress bar, question card
- Answer buttons with selection feedback
- Difficulty badges and score display"
```

---

### Task 9: Refactor QuizResultsScreen & SettingsScreen

**Files:**
- Modify: `src/screens/QuizResultsScreen.tsx`
- Modify: `src/screens/SettingsScreen.tsx`

**Steps:**

- [ ] **Step 1: Update QuizResultsScreen**

```typescript
import LottieView from 'lottie-react-native';

<TopBar title="Quiz Complete!" />

// Confetti animation
<LottieView
  source={require('../../assets/animations/confetti.json')}
  autoPlay
  style={{ height: 200 }}
/>

// Score display
<View style={{ alignItems: 'center', marginVertical: theme.spacing.xl }}>
  <View style={{
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' }}>
      {score}%
    </Text>
  </View>
</View>

// Breakdown
<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: theme.spacing.lg }}>
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{correct}</Text>
    <Text>Correct</Text>
  </View>
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{incorrect}</Text>
    <Text>Incorrect</Text>
  </View>
</View>

// CTAs
<Button label="Play Again" onPress={handleRetry} />
<Button label="Share Score" onPress={handleShare} variant="outlined" />
```

- [ ] **Step 2: Update SettingsScreen**

```typescript
<TopBar title="Settings" />

// Theme section
<Card style={{ marginBottom: theme.spacing.md }}>
  <Text style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>Appearance</Text>
  <ToggleSwitch label="Dark Mode" value={isDarkMode} onToggle={toggleTheme} />
</Card>

// Language section
<Card style={{ marginBottom: theme.spacing.md }}>
  <Text style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>Language</Text>
  <Picker selectedValue={language} onValueChange={setLanguage}>
    <Picker.Item label="English" value="en" />
    <Picker.Item label="Polish" value="pl" />
  </Picker>
</Card>

// Sound & Haptics
<Card style={{ marginBottom: theme.spacing.md }}>
  <ToggleSwitch label="Sound Effects" value={soundEnabled} onToggle={setSoundEnabled} />
  <ToggleSwitch label="Haptic Feedback" value={hapticEnabled} onToggle={setHapticEnabled} />
</Card>

// About
<Card>
  <Text>Version 1.0.0</Text>
  <Button label="Reset Progress" onPress={handleReset} variant="outlined" />
</Card>
```

- [ ] **Step 3: Test both screens**

Run: `npm start` → Complete quiz → Check results → Settings navigation

- [ ] **Step 4: Commit**

```bash
git add src/screens/QuizResultsScreen.tsx src/screens/SettingsScreen.tsx
git commit -m "refactor: redesign Quiz Results and Settings screens

- QuizResultsScreen with confetti animation, score badge, breakdown
- Play Again and Share CTAs
- SettingsScreen with theme toggle, language picker
- Sound/haptics toggles with visual feedback
- About section with version info"
```

---

## Phase 4: Animations & Polish

### Task 10: Add Lottie Animations

**Files:**
- Create: `src/assets/animations/` directory with JSON files
- Modify: Relevant screens to use animations

**Steps:**

- [ ] **Step 1: Download/create Lottie JSON files**

Get from Lottie library or create 4 animations:
- `rotating-earth.json` (globe rotation)
- `confetti.json` (celebration)
- `spinner.json` (loading)
- `achievement.json` (badge pop)

Save to `src/assets/animations/`

- [ ] **Step 2: Implement in HomeScreen**

```typescript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('../../assets/animations/rotating-earth.json')}
  autoPlay
  loop
  style={{ width: 140, height: 140 }}
/>
```

- [ ] **Step 3: Test animations**

Run: `npm start` → Verify smooth playback, no stuttering

- [ ] **Step 4: Commit**

```bash
git add src/assets/animations/
git commit -m "feat: add Lottie animations

- Rotating earth globe (HomeScreen)
- Confetti celebration (QuizResults)
- Loading spinner
- Achievement badge pop"
```

---

### Task 11: Implement Scroll-Triggered Animations

**Files:**
- Modify: `src/screens/ExploreScreen.tsx`, `src/screens/HomeScreen.tsx`

**Steps:**

- [ ] **Step 1: Add parallax effect to ExploreScreen**

```typescript
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';

const scrollY = useSharedValue(0);
const scrollHandler = useAnimatedScrollHandler((event) => {
  scrollY.value = event.contentOffset.y;
});

<Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
  {/* Content */}
</Animated.ScrollView>
```

- [ ] **Step 2: Hide/show floating nav on scroll**

Update FloatingNavBar to respond to scroll velocity

- [ ] **Step 3: Test scroll animations**

Run: `npm start` → Scroll screens → Verify nav hide/show behavior

- [ ] **Step 4: Commit**

```bash
git add src/screens/ExploreScreen.tsx src/components/Navigation/FloatingNavBar.tsx
git commit -m "feat: add scroll-triggered animations

- Parallax effect on country cards
- Floating nav hide/show based on scroll direction
- Smooth transitions with react-native-reanimated"
```

---

### Task 12: Accessibility & Performance Audit

**Files:**
- All modified files

**Steps:**

- [ ] **Step 1: Audit color contrast**

Use WCAG checker tool on all color combinations. Verify 4.5:1 ratio.

- [ ] **Step 2: Verify touch targets**

All buttons/icons: Minimum 48dp × 48dp. Check hitSlop on small elements.

- [ ] **Step 3: Add semantic labels**

```typescript
<Pressable
  accessibilityLabel="Settings button"
  accessibilityHint="Opens app settings"
  onPress={handleSettings}
>
  {/* icon */}
</Pressable>
```

- [ ] **Step 4: Test reduced motion preference**

```typescript
import { AccessibilityInfo } from 'react-native';

const prefersReducedMotion = await AccessibilityInfo.boldTextEnabled();

// Disable animations if true
if (prefersReducedMotion) {
  // Use instant state changes instead of animations
}
```

- [ ] **Step 5: Profile performance**

Run: `npm start` → Use React DevTools Profiler → Check FPS, render times

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: accessibility and performance audit

- WCAG AA color contrast verification
- 48dp touch target compliance
- Semantic labels for screen readers
- Reduced motion preference support
- GPU-accelerated animations confirmed
- Performance profiling: 60fps target achieved"
```

---

## Phase 5: Final QA

### Task 13: Cross-Device Testing & Light/Dark Mode Verification

**Files:**
- All screens

**Steps:**

- [ ] **Step 1: Test on multiple screen sizes**

- iPhone SE (small), iPhone 14 Pro (large), iPad (tablet)
- Verify layouts adapt correctly
- Check safe area handling (notch, home indicator)

- [ ] **Step 2: Test portrait & landscape**

All screens should work in both orientations

- [ ] **Step 3: Verify light mode**

Run: `npm start` → Toggle theme to light mode → Check all colors, contrast, readability

- [ ] **Step 4: Verify dark mode**

Toggle to dark mode → Same checks

- [ ] **Step 5: Create test checklist**

Document:
- ✅ HomeScreen: hero, daily card, stats, CTAs display
- ✅ ExploreScreen: search, filters, grid respond correctly
- ✅ CountryDetailsScreen: info cards render properly
- ✅ MapScreen: map interactive, FABs functional
- ✅ QuizScreen: progress bar animates, answers selectable
- ✅ QuizResultsScreen: score displays, animations play
- ✅ SettingsScreen: toggles work, theme changes immediately
- ✅ FloatingNavBar: navigates correctly, hide/show on scroll
- ✅ All animations: smooth 60fps
- ✅ Light & dark modes: equal visual quality
- ✅ Accessibility: WCAG AA compliant

- [ ] **Step 6: Commit final state**

```bash
git add .
git commit -m "test: comprehensive QA testing across devices and modes

- Cross-device testing (SE, Pro, iPad)
- Portrait & landscape orientation testing
- Light & dark mode visual verification
- Animation performance (60fps) confirmed
- Accessibility compliance verified
- All 7 screens fully functional and styled"
```

---

## Success Criteria Checklist

- [ ] All 6 screens refactored (Home, Explore, CountryDetails, Map, Quiz, Results, Settings)
- [ ] Material Design 3 + earth-exploration theme applied consistently
- [ ] Color palette (blue/green/white) used throughout
- [ ] Light & dark modes functional and equal quality
- [ ] Design tokens system working (no hardcoded colors)
- [ ] Atomic component library complete (Button, Card, Badge, Input, Toggle, Progress)
- [ ] Top bar and floating navigation implemented globally
- [ ] Playful animations on interactions (buttons, cards, transitions)
- [ ] Lottie animations integrated (earth, confetti, loading, achievement)
- [ ] WCAG AA accessibility compliance
- [ ] 60fps performance on mid-range devices
- [ ] TypeScript types complete
- [ ] All changes committed with descriptive messages
- [ ] Portfolio-quality code throughout

---

**Plan Version**: 1.0  
**Estimated Duration**: 2-3 weeks (parallel-friendly phases)  
**Last Updated**: 2026-06-30
