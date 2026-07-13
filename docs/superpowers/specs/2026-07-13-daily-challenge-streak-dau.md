# Daily Challenge + Streak Feature Design
**Date:** 2026-07-13  
**Goal:** Increase daily active users (DAU) through daily challenge and streak visibility  
**Scope:** v2.0.7 release  

---

## Overview

Add a **daily random country challenge** and **streak badge** to HomeScreen to incentivize daily app opens. Users see a featured country each day, learn about it, quiz themselves, and maintain a streak. Optional notifications remind users at a set time (default 9 AM).

**Success Metrics:**
- DAU increases by 15-20%
- Avg session time increases (users stay longer to complete daily challenge)
- Notification opt-in rate > 60%

---

## Architecture

### New/Modified Files

| File | Purpose | Type |
|------|---------|------|
| `utils/dailyChallenge.ts` | Random country selection, date-based caching | New |
| `screens/HomeScreen.tsx` | Display streak badge + daily challenge card | Modified |
| `src/components/ui/DailyChallengeCard.tsx` | Reusable card for daily challenge | New |
| `src/components/NotificationService.ts` | Schedule daily reminder notifications | New |
| `screens/SettingsScreen.tsx` | Add notification time picker toggle | Modified |
| `context/QuizHistoryContext.tsx` | Wire streak data to HomeScreen (no changes needed) | Reference |

### Data Flow

```
1. App opens
   ↓
2. dailyChallenge.ts checks AsyncStorage for today's country
   ├─ If cache exists AND date matches → return cached country
   └─ If cache expired (different date) → select random country, save to AsyncStorage
   ↓
3. HomeScreen fetches:
   - Today's country from dailyChallenge
   - Current streak from QuizHistoryContext.getStats()
   ↓
4. Display streak badge + DailyChallengeCard
   ↓
5. User taps "Learn & Quiz"
   ├─ Navigate to QuizScreen
   ├─ Pre-select today's country (if possible, skip picker)
   └─ After quiz → streak updates in QuizHistoryContext
   ↓
6. If notifications enabled → schedule reminder at user's set time (default 9 AM)
```

---

## Features

### Feature 1: Daily Challenge Card on HomeScreen

**Component:** `DailyChallengeCard.tsx`

**Display:**
```
┌────────────────────────────┐
│ 🇯🇵 Japan                  │
│ Today's Challenge          │
│                            │
│ Learn & Quiz               │
└────────────────────────────┘
```

**Props:**
- `country: Country` — today's featured country
- `onPress: () => void` — navigate to quiz
- `testID?: string` — for testing

**Behavior:**
- Show country flag + name + "Today's Challenge" label
- CTA button: "Learn & Quiz" (primary action)
- Tapping navigates to QuizScreen with country pre-selected
- No action if user hasn't completed yesterday's country (no gatekeeping, just visual)

**Styling:**
- Use design tokens from `theme/tokens.ts`
- Rounded corners (12-16dp per MD3)
- Shadow/elevation for card effect
- Responsive padding (md spacing)

---

### Feature 2: Streak Badge on HomeScreen

**Display Location:** Below "Welcome" header, above daily challenge card

**Visual:**
```
🔥 28-day streak
[████████░░░░░░░░░░░░░░] 28/365
```

**Logic:**
- Only show if `streak > 0`
- Show: emoji + day count + optional progress bar
- Use `QuizHistoryContext.getStats().currentStreak`
- Update automatically after each quiz

**Styling:**
- Fire emoji (🔥) for visual impact
- Theme color (primary) for bar
- Small/subtle if streak is low (1-2 days)
- Bold if streak is high (7+ days)

---

### Feature 3: Daily Challenge Logic

**File:** `utils/dailyChallenge.ts`

```typescript
interface DailyChallengeData {
  countryCode: string;
  dateKey: string; // YYYY-MM-DD (local timezone)
  countryName: string;
}

// Get today's challenge
export async function getTodayChallenge(
  allCountries: Country[]
): Promise<DailyChallengeData>

// Check if cached challenge is expired
export function isChallengeExpired(dateKey: string): boolean

// Persist to AsyncStorage
export async function saveDailyChallenge(
  data: DailyChallengeData
): Promise<void>

// Load from AsyncStorage
export async function loadDailyChallenge(): Promise<DailyChallengeData | null>
```

**Key Behaviors:**
- Use local timezone (not UTC) for date comparison
- Cache country in AsyncStorage with date key `YYYY-MM-DD`
- On app open, check if cache date matches today (local)
- If expired → pick random country from all 195 countries, save new cache
- If not expired → return cached country (consistency all day)
- Random selection: `Math.random()` is sufficient (no need for weighted distribution)

**Error Handling:**
- AsyncStorage read failure → log warning, show placeholder, allow manual country selection
- AsyncStorage write failure → continue without persisting (next app open picks new country)
- No countries available → show "Pick a country" prompt instead of card

**Testing:**
- Unit: Date logic, cache expiry detection, randomization
- Integration: HomeScreen renders correct country on first load, same country on reload

---

### Feature 4: Optional Notifications

**File:** `src/components/NotificationService.ts`

**SettingsScreen Changes:**
- Add new Card section: "Notifications"
- Inside card: toggle "Daily Challenge Reminder" + time picker "Remind me at [09:00 AM]" (if enabled)
- Storage: `AsyncStorage` key `dailyChallenge_notificationsEnabled` + `dailyChallenge_reminderTime`
- Placement: After "Sound & Haptics" card, before "Data" section

**Notification Behavior:**
- If enabled → schedule daily notification at user's set time (default 9 AM)
- Message: "🌍 Today's country: [Country Name] — Ready to learn?"
- Tap notification → opens app to HomeScreen (daily challenge card visible)
- Notification should fire every day (use native scheduler, e.g., `react-native-notifications`)

**Permission Handling:**
- Request notification permission on first toggle enable
- If permission denied → show alert: "Enable notifications in Settings to receive reminders"
- Link to device Settings (if possible)

**Implementation Note:**
- Use existing notification library (check `package.json` for what's available)
- Fallback: Use `expo-notifications` if available
- Time persistence: Store in AsyncStorage, restore on app start

**Error Handling:**
- Scheduling fails → log error, show toast "Couldn't schedule notification"
- Permission denied → allow user to retry or skip

---

## Integration Points

### HomeScreen

**Current state:**
- Displays: logo, welcome message, quick stats, navigation cards

**Changes:**
- Below header, add `StreakBadge` (if streak > 0)
- Below streak badge, add `DailyChallengeCard`
- Fetch data from:
  - `dailyChallenge.getTodayChallenge(countries)`
  - `useQuizHistory().getStats()` for streak

**Example layout:**
```
┌─ HomeScreen ─────────────┐
│ 🌍 World Explorer        │
│                           │
│ 🔥 28-day streak          │ ← StreakBadge
│ [progress bar]            │
│                           │
│ ┌─ Daily Challenge ─┐    │
│ │ 🇯🇵 Japan         │    │ ← DailyChallengeCard
│ │ Learn & Quiz      │    │
│ └───────────────────┘    │
│                           │
│ [Other cards below]       │
└───────────────────────────┘
```

### QuizScreen

**Current state:**
- User selects country → difficulty → quiz

**Changes:**
- If navigated from daily challenge card → country pre-selected
- Pass `countryCode` as route param: `navigation.navigate('Quiz', { countryCode: 'JP' })`
- QuizScreen skips country picker if `countryCode` provided
- After quiz completes → streak updates automatically

---

## Data & Storage

### AsyncStorage Keys

| Key | Value | Type | Example |
|-----|-------|------|---------|
| `worldexplorer_daily_challenge` | `DailyChallengeData` (JSON) | JSON string | `{"countryCode":"JP","dateKey":"2026-07-13","countryName":"Japan"}` |
| `worldexplorer_notifications_enabled` | boolean | string | `"true"` |
| `worldexplorer_reminder_time` | HH:MM (24-hour) | string | `"09:00"` |

---

## Error Handling & Edge Cases

| Scenario | Behavior |
|----------|----------|
| AsyncStorage fails on first open | Show placeholder, allow manual country selection |
| No countries in database | Show "Pick a country to start" prompt |
| User timezone changes mid-day | Cache checked by local date, works correctly |
| Notification permission denied | Allow user to retry, offer Settings link |
| Notification scheduling fails | Log error, continue without notifications |
| User completes multiple quizzes same day | Streak updates correctly (no double-count) |
| App opened after midnight | New random country selected automatically |
| User disables notifications mid-week | Toggle saves immediately, notification cancelled |

---

## Testing Strategy

### Unit Tests

**`utils/dailyChallenge.test.ts`**
- ✓ `getTodayChallenge()` returns cached country if date matches
- ✓ `getTodayChallenge()` selects new random country if date expired
- ✓ `isChallengeExpired()` correctly detects date changes (timezone-aware)
- ✓ `saveDailyChallenge()` persists to AsyncStorage
- ✓ Handles AsyncStorage read/write failures gracefully

**`src/components/NotificationService.test.ts`**
- ✓ Schedules notification at correct time
- ✓ Cancels notification when disabled
- ✓ Handles permission denials

### Integration Tests

**`screens/HomeScreen.test.tsx`**
- ✓ Renders StreakBadge if streak > 0
- ✓ Renders DailyChallengeCard with today's country
- ✓ Tapping card navigates to QuizScreen with countryCode param
- ✓ Card updates to new country after midnight (simulated)

**`screens/quiz/QuizScreen.test.tsx`** (existing, extend)
- ✓ If `countryCode` param provided, skip country picker
- ✓ Quiz completes with correct country

### Manual Testing

- [ ] Open app, verify streak badge + daily challenge card display
- [ ] Tap card, complete quiz, return to home
- [ ] Verify streak increments
- [ ] Close and reopen app same day, verify same country shown
- [ ] Wait past midnight (simulated with device time), verify new country selected
- [ ] Enable notifications, verify reminder fires at set time
- [ ] Disable notifications, verify no reminder fires
- [ ] Test on iOS and Android

---

## Dependencies

**New packages needed:**
- Check if `expo-notifications` already available; if not, add it
- No other new dependencies required

**Existing dependencies used:**
- `@react-native-async-storage/async-storage` (already in use)
- `react-i18next` (for "Today's Challenge" label translation)
- Theme tokens from `src/theme/tokens.ts`

---

## Localization

**New strings needed:**
- `dailyChallenge` → "Today's Challenge"
- `learnAndQuiz` → "Learn & Quiz"
- `streakDays` → "%d-day streak"
- `notificationMessage` → "🌍 Today's country: %s — Ready to learn?"
- `remindMeAt` → "Remind me at"
- `dailyChallengeReminder` → "Daily Challenge Reminder"

Add to all 5 locale files: `en.json`, `es.json`, `de.json`, `fr.json`, `pl.json`

---

## Deployment & Rollout

### v2.0.7 Release Checklist
- [ ] SDK fix: Update RevenueCat to latest (separate commit)
- [ ] Implement daily challenge feature (Phase 1 + 2)
- [ ] All tests passing (unit + integration + manual)
- [ ] Translations validated for all 5 locales
- [ ] Design tokens used consistently (no hardcoded colors)
- [ ] Accessibility: Touch targets 48dp+, contrast 4.5:1
- [ ] Beta test with 10% of users first (if using Play Store staged rollout)
- [ ] Monitor DAU, session time, notification opt-in rate

---

## Success Criteria

| Metric | Target | Timeline |
|--------|--------|----------|
| DAU increase | +15-20% | 2 weeks post-launch |
| Notification opt-in | >60% of active users | 1 week |
| Avg session time | +2-3 min | 2 weeks |
| Crash rate | <0.1% | Immediate |
| Streak retention | 70% maintain streak > 7 days | 30 days |

---

## Known Limitations & Future Work

1. **No personalization:** Daily country is same for all users (not user-specific)
   - Future: Personalize based on weak quiz topics
2. **No leaderboard:** Users can't compare streaks with others
   - Future: Add multiplayer/competitive features
3. **Notifications only at one time:** User can't set multiple reminders
   - Future: Allow multiple reminder times

---

## References

- Quiz history context: `context/QuizHistoryContext.tsx`
- Theme tokens: `src/theme/tokens.ts`
- Design system: Material Design 3
- Translations: `src/locales/*.json`
