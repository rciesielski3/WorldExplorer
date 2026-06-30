# Navigation Layout Quick Reference

**TL;DR** - All key information for developers implementing TopBar + FloatingNavBar

---

## Component Specifications

### TopBar
```
Height: 56dp
Safe Area: Respect insets.top
Background: theme.colors.topBar
Border: 1px bottom, theme.colors.border
Content: Back button (if needed) + Title + Menu (if needed)
Z-index: Above content
```

### FloatingNavBar
```
Height: 56dp (content) + safe area bottom
Position: Absolute, bottom: 0, left: 0, right: 0
Padding: 16dp above safe area bottom
Background: theme.colors.floatingNav
Border: 1px top, theme.colors.border
Content: 4 Icons (Explore, Map, Quiz, Settings)
Z-index: Above content (pointer-events: box-none)
Icons: From react-native-vector-icons
```

---

## Safe Area Insets (useSafeAreaInsets)

### iPhone SE (No Notch)
```
top: 20dp    (status bar)
bottom: 0dp  (no home indicator)
left: 0dp
right: 0dp
```

### iPhone 14 Pro (Dynamic Island + Home Indicator)
```
top: 14-16dp (Dynamic Island)
bottom: 34dp (home indicator)
left: 0dp
right: 0dp
```

### iPad (Varies by Orientation)
```
Portrait:
  top: 20dp, bottom: 0dp

Landscape:
  top: 20dp, bottom: 0dp
  (or with notch: left/right may have insets)
```

---

## Padding Requirements by Screen

### HomeScreen
```javascript
homeScrollContent: {
  paddingBottom: 56 + 16 + insets.bottom,  // 72dp + safe area
  paddingTop: 28,
  paddingHorizontal: 16,
}
```

### MapScreen
```javascript
mapContent: {
  paddingBottom: 56 + 16 + insets.bottom,  // 72dp + safe area
  padding: 16,
  paddingTop: 18,
}
```

### ExploreScreen
```javascript
flatListContentContainer: {
  paddingBottom: 56 + 16 + insets.bottom,  // 72dp + safe area
  paddingHorizontal: 16,
}
```

### QuizScreen
```javascript
quizContainer: {
  paddingBottom: 56 + 16 + insets.bottom,  // 72dp + safe area
  paddingHorizontal: 16,
}
```

### SettingsScreen
```javascript
settingsContentContainer: {
  paddingBottom: 56 + 16 + insets.bottom,  // 72dp + safe area
  paddingHorizontal: 16,
}
```

### CountryDetailsScreen
```javascript
detailsContentContainer: {
  paddingBottom: 56 + 16 + insets.bottom,  // 72dp + safe area
  paddingHorizontal: 16,
}
```

---

## Component Code Templates

### TopBar Component
```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';

export const TopBar = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = React.useContext(ThemeContext);

  const showBackButton = route.name !== 'Home';
  const title = getScreenTitle(route.name);

  return (
    <View
      style={{
        paddingTop: insets.top,
        height: 56 + insets.top,
        backgroundColor: theme.colors.topBar || theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 12,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'Exo2-Bold',
            color: theme.colors.text,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialCommunityIcons
          name="dots-vertical"
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};
```

### FloatingNavBar Component
```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';

const NAV_ITEMS = [
  { key: 'home', icon: 'home', screen: 'Home' },
  { key: 'explore', icon: 'earth', screen: 'Explore' },
  { key: 'map', icon: 'map', screen: 'Map' },
  { key: 'quiz', icon: 'puzzle', screen: 'Quiz' },
];

export const FloatingNavBar = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = React.useContext(ThemeContext);

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom + 16,
        height: 56 + insets.bottom + 16,
        backgroundColor: theme.colors.card,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        pointerEvents: 'box-none', // Allow content behind to be interactive
      }}
      pointerEvents="auto" // Re-enable for this view
    >
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={() => {
            if (route.name !== item.screen) {
              navigation.navigate(item.screen);
            }
          }}
          style={{
            flex: 1,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'auto',
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={28}
            color={
              route.name === item.screen || route.name === 'CountryDetails'
                ? theme.colors.button
                : theme.colors.text
            }
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### Safe ScrollView Wrapper
```tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SafeScrollView = ({ children, style, contentContainerStyle, ...props }) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={style}
      contentContainerStyle={[
        {
          paddingBottom: 56 + 16 + insets.bottom,
        },
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
};
```

---

## Common Issues & Fixes

### Issue: Content Obscured by FloatingNav

**Problem**: Bottom content gets cut off  
**Solution**: Add `paddingBottom: 56 + 16 + insets.bottom` to ScrollView

```javascript
contentContainerStyle={{
  paddingBottom: 56 + 16 + insets.bottom,
}}
```

### Issue: Map Gestures Blocked

**Problem**: Can't pan/zoom map due to FloatingNav overlay  
**Solution**: Use `pointerEvents: 'box-none'` on FloatingNav container

```jsx
<View pointerEvents="box-none" style={{ position: 'absolute' }}>
  {/* Nav items with pointerEvents: 'auto' */}
</View>
```

### Issue: Dynamic Island Obscured Content

**Problem**: Content behind Dynamic Island on iPhone 14 Pro  
**Solution**: Add `paddingTop: insets.top` to TopBar

```javascript
paddingTop: insets.top,
height: 56 + insets.top,
```

### Issue: Uneven Safe Area Handling

**Problem**: Layout looks different on different devices  
**Solution**: Always use `useSafeAreaInsets()` hook

```tsx
const insets = useSafeAreaInsets();
// Use insets.top, insets.bottom, insets.left, insets.right
```

---

## Testing Checklist (Quick)

### Visual
- [ ] TopBar visible on all screens
- [ ] FloatingNav visible at bottom
- [ ] No overlaps
- [ ] Content scrolls behind nav
- [ ] Text readable

### Functional
- [ ] Navigation works (all screens reachable)
- [ ] Back button works
- [ ] Map interactive (MapScreen)
- [ ] Search works (ExploreScreen)
- [ ] Scrolling smooth

### Devices
- [ ] iPhone SE tested
- [ ] iPhone 14 Pro tested
- [ ] iPad tested
- [ ] Landscape tested

### Console
- [ ] No warnings
- [ ] No errors
- [ ] No frame drops

---

## Key Dimensions

| Component | Dimension | Notes |
|-----------|-----------|-------|
| TopBar Height | 56dp | Standard Material Design |
| FloatingNav Height | 56dp | Standard Material Design |
| Touch Target Min | 48×48dp | iOS/Android accessibility |
| Content Safe Margin | 16dp | Material Design spacing |
| Status Bar | 20dp | iOS standard |
| Home Indicator | 34dp | iPhone X and newer |
| Dynamic Island | 14-16dp | iPhone 14 Pro |

---

## File Locations

| File | Purpose |
|------|---------|
| `docs/navigation-layout.md` | Full specification |
| `docs/navigation-layout-testing.md` | Testing guide |
| `docs/navigation-layout-analysis.md` | Pre-flight analysis |
| `components/TopBar.tsx` | TopBar component (to create) |
| `components/FloatingNavBar.tsx` | FloatingNavBar component (to create) |

---

## Safe Area Context Hook

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// In your component
const insets = useSafeAreaInsets();

// Available values
console.log(insets.top);     // Status bar, notch, etc.
console.log(insets.bottom);  // Home indicator, gesture area, etc.
console.log(insets.left);    // Left notch, etc.
console.log(insets.right);   // Right notch, etc.
```

---

## Color Configuration

Update `theme.colors` in ThemeContext to include:

```javascript
colors: {
  topBar: '#FFFFFF',          // or theme-aware
  floatingNav: '#FFFFFF',     // or theme-aware
  button: '#6366F1',          // Already exists
  text: '#000000',            // Already exists
  border: '#E5E7EB',          // Already exists
  card: '#FFFFFF',            // Already exists
}
```

---

## Dependencies Already Installed

```json
{
  "react-native-safe-area-context": "5.4.0",
  "@react-navigation/native": "6.1.18",
  "@react-navigation/stack": "6.4.2",
  "react-native-vector-icons": "10.1.0"
}
```

**No additional packages needed!**

---

## Implementation Order

1. Create `components/TopBar.tsx`
2. Create `components/FloatingNavBar.tsx`
3. Update `App.tsx` to include both components
4. Update `HomeScreen.js` padding
5. Update `ExploreScreen.js` padding
6. Update `MapScreen.js` padding
7. Update `QuizScreen.js` padding
8. Update `SettingsScreen.js` padding
9. Update `CountryDetailsScreen.js` padding
10. Test on all devices
11. Fix issues and fine-tune

---

## Emergency Contact

If blocked, refer to:
- Full spec: `docs/navigation-layout.md`
- Testing guide: `docs/navigation-layout-testing.md`
- Analysis: `docs/navigation-layout-analysis.md`
