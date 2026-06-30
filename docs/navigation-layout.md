# Navigation Layout Reference

## Overview

This document defines the layout and positioning of the navigation components in WorldExplorer:
- **TopBar**: 56dp height, positioned at the top with safe area respect
- **FloatingNavBar**: 56dp height, positioned at the bottom with 16dp margin above safe area

## Layout Diagrams

### Standard Portrait Layout (Safe Area Normal)

```
┌─────────────────────────────────────┐
│ Status Bar (20dp - system)          │  <- System Status Bar
├─────────────────────────────────────┤
│ TopBar (56dp)                       │  <- Custom Top Navigation
│ [<] Settings   [⋮]                  │
├─────────────────────────────────────┤
│                                     │
│                                     │
│  Main Content Area                  │  <- Scrollable/Interactive Content
│  (MapScreen, ExploreScreen, etc.)   │    Scrolls behind FloatingNav
│                                     │
│                                     │
├─────────────────────────────────────┤  <- Safe area bottom boundary
│ FloatingNavBar (56dp)               │
│ [🏠] [🗺] [🧩] [⚙️]                 │
├─────────────────────────────────────┤
│ Home Indicator (34dp - iPhone only) │  <- Notch/Home Indicator Area
└─────────────────────────────────────┘
```

### iPhone SE Layout (No Notch, Small Safe Areas)

```
Portrait (SE: 375x667):
┌──────────────────────────┐
│ Status (20dp)            │
├──────────────────────────┤
│ TopBar (56dp)            │ <- No top safe area inset
├──────────────────────────┤
│                          │
│ Content Area             │ <- Full width, 375dp
│ (375dp × ~519dp)         │
│                          │
├──────────────────────────┤
│ FloatingNav (56dp)       │ <- 16dp margin to bottom
│ [Icons]                  │
└──────────────────────────┘   <- No home indicator bottom inset

Safe Area Insets:
  - Top: 0dp
  - Bottom: 0dp
  - Left: 0dp
  - Right: 0dp
```

### iPhone 14 Pro Layout (Dynamic Island + Home Indicator)

```
Portrait (14 Pro: 393x852):
┌──────────────────────────────┐
│ Status (10dp to notch edge)  │
│ [🔋 📶] Dynamic Island [>]    │ <- System Dynamic Island
├──────────────────────────────┤
│ TopBar (56dp)                │ <- Respects 16dp safe area top (if present)
│ [<] CountryDetails [⋮]       │
├──────────────────────────────┤
│                              │
│ Content Area                 │ <- Full width, 393dp
│ (393dp × ~620dp)             │
│                              │
├──────────────────────────────┤
│ FloatingNav (56dp)           │ <- 16dp margin above indicator
│ [🏠] [🗺] [🧩] [⚙️]           │
│                              │
│ Home Indicator (~34dp)       │ <- Always present
└──────────────────────────────┘

Safe Area Insets:
  - Top: 14-16dp (Dynamic Island height)
  - Bottom: 34dp (Home Indicator)
  - Left: 0dp
  - Right: 0dp
```

### iPad Landscape Layout (Large Safe Areas)

```
Landscape (iPad: 1194x834):
┌────────────────────────────────────────────────┐
│ Status Bar (20dp)                              │
├────────────────────────────────────────────────┤
│ TopBar (56dp)                                  │
│ [<] Countries   [Search]   [Filters] [⋮]       │
├────────────────────────────────────────────────┤
│          │                                      │
│ Side     │                                      │
│ Panel    │  Content Area (Full remaining space)│
│ (optional)                                      │
│          │                                      │
├────────────────────────────────────────────────┤
│ FloatingNav (56dp) - Horizontal Layout         │
│ [🏠] [🗺] [🧩] [⚙️]                             │
└────────────────────────────────────────────────┘

Safe Area Insets (varies by notch position):
  - Top: 20dp (system status bar)
  - Bottom: 0-20dp (depends on orientation)
  - Left: 0-20dp (left notch if present)
  - Right: 0-20dp (right notch if present)
```

## Safe Area Handling

### What is Safe Area?

Safe area is the region of the screen that is guaranteed to be visible and not obscured by:
- Status bar
- Notch / Dynamic Island (iOS)
- Home indicator (iOS)
- Gesture navigation buttons (Android)
- System UI elements

### Implementation Requirements

1. **TopBar Positioning**
   ```
   - Place TopBar immediately below status bar
   - Use Platform.OS to handle iOS vs Android differences
   - Respect safe area insets via useSafeAreaInsets()
   - Never overlap with system status bar
   ```

2. **FloatingNavBar Positioning**
   ```
   - Position at bottom of screen
   - Apply 16dp margin above the home indicator
   - Use position: 'absolute' for overlay effect
   - Content scrolls behind the nav (z-index)
   - Never cut off interactive elements
   ```

3. **Content Scrolling**
   ```
   - ScrollView/FlatList should extend full height
   - Add paddingBottom to account for FloatingNav
   - Content scrolls behind floating nav (not blocked)
   - Header and footer padding respect safe areas
   ```

## Screen-Specific Notes

### HomeScreen
- **Layout**: ScrollView with vertical stacking
- **TopBar**: Minimal (logo/title only, no back button)
- **FloatingNav**: Shows all 4 icons (Explore, Map, Quiz, Settings)
- **Content**: 
  - Hero section with animation
  - Quick action cards (2-column grid)
  - Daily country feature card
  - All content scrolls behind FloatingNav
- **Safe Area Handling**: 
  - paddingBottom: 72dp (56dp nav + 16dp margin)
  - Ensure daily country card doesn't get cut off

### MapScreen
- **Layout**: Complex (map + overlay controls)
- **TopBar**: With back button and title
- **FloatingNav**: Show 4 icons
- **Critical**: 
  - Map must remain interactive above FloatingNav
  - Zoom controls positioned on map (right side)
  - Legend shown below map, before FloatingNav
  - No content cut off by nav
- **Scroll Behavior**:
  - Map doesn't scroll (fixed)
  - Legend scrolls if needed
  - No content blocked by FloatingNav
- **Touch Targets**:
  - Ensure 48dp minimum touch area for zoom buttons
  - FloatingNav should not interfere with map gestures

### ExploreScreen
- **Layout**: Search bar + scrollable country list
- **TopBar**: Minimal (title, possibly search icon)
- **FloatingNav**: Show all 4 icons
- **Content**:
  - Search input at top (fixed or sticky)
  - Region filter pills (horizontal scroll)
  - Country list (FlatList with dynamic height)
  - All scrolls behind FloatingNav
- **Safe Area Handling**:
  - paddingBottom: 72dp on FlatList
  - Search bar remains visible while scrolling

### QuizScreen
- **Layout**: Quiz question + answer options
- **TopBar**: With back button and progress indicator
- **FloatingNav**: Show 4 icons
- **Content**:
  - Question displayed in center
  - 4 answer options displayed below
  - Next/Submit button
  - Ensure buttons don't get cut off
- **Safe Area Handling**:
  - Ensure bottom answer option has 72dp padding
  - No buttons obscured by FloatingNav

### SettingsScreen
- **Layout**: ScrollView with setting groups
- **TopBar**: With back button
- **FloatingNav**: Show all 4 icons
- **Content**:
  - Theme selector
  - Language selector
  - Premium options
  - About section
  - All scrolls behind FloatingNav
- **Safe Area Handling**:
  - paddingBottom: 72dp
  - Ensure all toggles/buttons are reachable

### CountryDetailsScreen
- **Layout**: Header image + scrollable details
- **TopBar**: With back button and country name
- **FloatingNav**: Show all 4 icons
- **Content**:
  - Flag/header image
  - Country details (capital, population, etc.)
  - Map embed
  - More info sections
  - All scrolls behind FloatingNav
- **Safe Area Handling**:
  - paddingBottom: 72dp
  - Header image doesn't get cut off

## Component Implementation Guidelines

### TopBar Component Structure
```jsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

<View style={{
  paddingTop: insets.top,  // Respect status bar
  height: 56 + insets.top,
  backgroundColor: theme.colors.topBar,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
}}>
  {/* TopBar content */}
</View>
```

### FloatingNavBar Component Structure
```jsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

<View style={{
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  paddingBottom: insets.bottom + 16,  // 16dp margin + safe area
  height: 56 + insets.bottom + 16,
  backgroundColor: theme.colors.floatingNav,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
}}>
  {/* Navigation icons */}
</View>
```

### Content Scroll View Structure
```jsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

<ScrollView
  contentContainerStyle={{
    paddingBottom: 56 + 16 + insets.bottom,  // FloatingNav + margin + safe area
    paddingTop: 16,
    paddingHorizontal: 16,
  }}
>
  {/* Screen content */}
</ScrollView>
```

## Measurements Summary

| Component | Height | Top Margin | Bottom Margin | Notes |
|-----------|--------|-----------|---------------|-------|
| Status Bar | 20dp (varies) | — | 0 | System element |
| TopBar | 56dp | insets.top | 0 | Custom navigation |
| Content Area | Remaining | 0 | 16dp | Scrollable content |
| FloatingNavBar | 56dp | 0 | 16dp + insets.bottom | Always visible overlay |
| Home Indicator | 34dp (varies) | 0 | — | System element (iOS) |

## Validation Checklist

### Visual Checks
- [x] TopBar visible and readable on all devices
- [x] TopBar doesn't overlap with status bar
- [x] FloatingNav visible at bottom of all devices
- [x] No visual overlap between TopBar and FloatingNav
- [x] Content doesn't get cut off by either bar
- [x] Content scrolls smoothly behind FloatingNav
- [x] No jarring layout shifts when scrolling

### Device/Simulator Testing
- [x] iPhone SE (375×667, no notch)
  - [x] TopBar positioning correct
  - [x] FloatingNav positioning correct
  - [x] Content scrolling works
  - [x] All buttons reachable
- [x] iPhone 14 Pro (393×852, Dynamic Island + home indicator)
  - [x] TopBar respects Dynamic Island
  - [x] FloatingNav respects home indicator spacing
  - [x] Content scrolling works
  - [x] All buttons reachable
  - [x] Dynamic Island doesn't obscure content
- [x] iPad (1194×834, large safe area)
  - [x] Both orientations tested
  - [x] Layout adapts to landscape
  - [x] Content properly positioned
  - [x] All buttons reachable

### Screen-Specific Testing
- [x] HomeScreen
  - [x] All 4 action cards visible without scrolling
  - [x] Daily country card doesn't get cut off
  - [x] FloatingNav navigation works
  - [x] Scroll continues smoothly
- [x] MapScreen
  - [x] Map is fully interactive above FloatingNav
  - [x] Zoom controls accessible
  - [x] Legend visible below map
  - [x] No content obscured by nav
  - [x] Pan/zoom gestures work smoothly
- [x] ExploreScreen
  - [x] Search bar remains functional
  - [x] Country list scrolls smoothly
  - [x] All country items clickable
  - [x] Scroll reaches bottom
- [x] QuizScreen
  - [x] All 4 answer options visible
  - [x] Bottom answer button not cut off
  - [x] Submit/next button accessible
  - [x] Question centered properly
- [x] SettingsScreen
  - [x] All settings visible
  - [x] Toggle switches accessible
  - [x] Scroll reaches bottom
  - [x] All buttons reachable
- [x] CountryDetailsScreen
  - [x] Header image not cut off
  - [x] All details visible
  - [x] Embedded map interactive
  - [x] Scroll reaches bottom

### Interaction Testing
- [x] FloatingNav icons respond to touch immediately
- [x] Navigation transitions are smooth
- [x] No lag when scrolling content
- [x] Touch targets are at least 48×48dp
- [x] Scroll bounce (iOS) works correctly
- [x] Scroll continues smoothly behind nav

### Edge Cases
- [x] Large text size setting (accessibility)
  - [x] Content still fits properly
  - [x] No text truncation
  - [x] TopBar/FloatingNav scale appropriately
- [x] Landscape orientation
  - [x] Layout adapts correctly
  - [x] Content repositions properly
  - [x] No overlaps
- [x] Split-screen (iPad)
  - [x] Layout adapts to smaller area
  - [x] All elements remain accessible

## Known Issues & Resolutions

### Issue: Content Covered by FloatingNav
**Status**: ✅ Resolved
**Solution**: Add `paddingBottom: 72dp` to ScrollView content

### Issue: Map Not Interactive Behind Nav
**Status**: ✅ Resolved
**Solution**: Use `pointerEvents="box-none"` on FloatingNav overlay

### Issue: Dynamic Island Overlap (iPhone 14 Pro)
**Status**: ✅ Resolved
**Solution**: Respect `insets.top` in TopBar padding, use `useSafeAreaInsets()`

## Implementation Checklist

- [x] Create `components/TopBar.tsx` with safe area handling
- [x] Create `components/FloatingNavBar.tsx` with proper positioning
- [x] Update `App.tsx` to include both bars on all screens
- [x] Update all screen components to use safe area padding
- [x] Test on iPhone SE simulator
- [x] Test on iPhone 14 Pro simulator
- [x] Test on iPad simulator (both orientations)
- [x] Verify no console warnings
- [x] Check accessibility with screen readers
- [x] Performance test (no frame drops during scroll)

## References

- React Native Safe Area Context: https://github.com/th3rd-place/react-native-safe-area-context
- Material Design: 56dp (56×56dp) is standard touch target for bottom navigation
- iOS Human Interface Guidelines: Safe area requirements
- Android Material Design: Bottom navigation bar specifications
