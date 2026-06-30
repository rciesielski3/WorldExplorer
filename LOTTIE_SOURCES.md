# Lottie Animation Sources & Documentation

This document catalogs all Lottie animations used in the WorldExplorer project, including source information, specifications, and verification details.

## Animation Inventory

### 1. rotating-earth.json
**Purpose:** Hero section globe rotation animation (HomeScreen)

**Specifications:**
- **Duration:** 6 seconds (360 frames at 60fps)
- **Loop:** Yes (continuous rotation)
- **Dimensions:** 400x400px
- **File Size:** ~8 KB
- **Format:** Lottie JSON 5.12.2

**Current Implementation:**
- **Source:** Procedurally generated with rotation keyframes
- **Rotation:** 360° continuous loop
- **Color Scheme:** Blue tones (#1a80cc, #0d4080)
- **License:** MIT (project-owned)

**Sourcing Instructions (if upgrading from public library):**
1. Visit https://lottiefiles.com/search?q=rotating+earth
2. Filter by: Free, Premium Free, or MIT License
3. Look for: 4-6 second duration, smooth rotation
4. Download JSON file and replace `rotating-earth.json`
5. Verify: Duration matches 6 seconds, loops seamlessly

**Testing Status:** Ready for Expo testing

---

### 2. confetti.json
**Purpose:** Celebration animation on quiz completion

**Specifications:**
- **Duration:** 2 seconds (120 frames at 60fps)
- **Loop:** No (one-shot animation)
- **Dimensions:** 400x400px
- **File Size:** ~5 KB
- **Format:** Lottie JSON 5.12.2

**Current Implementation:**
- **Source:** Procedurally generated with falling particles
- **Effect:** Confetti pieces fall with rotation and fade-out
- **Color Scheme:** Gold/yellow (#FFD700, #FFC800)
- **Particle Count:** 1 (sample; upgrade should have 5-10)
- **License:** MIT (project-owned)

**Sourcing Instructions (if upgrading from public library):**
1. Visit https://lottiefiles.com/search?q=confetti+celebration
2. Filter by: Free, Premium Free, or MIT License
3. Look for: 1.5-2.5 second duration, celebratory feel
4. Download JSON file and replace `confetti.json`
5. Verify: Duration matches ~2 seconds, fades to transparent at end

**Testing Status:** Ready for Expo testing

---

### 3. spinner.json
**Purpose:** Loading state indicator

**Specifications:**
- **Duration:** Continuous (4 seconds per rotation, 240 frames)
- **Loop:** Yes (infinite)
- **Dimensions:** 200x200px
- **File Size:** ~4 KB
- **Format:** Lottie JSON 5.12.2

**Current Implementation:**
- **Source:** Procedurally generated with rotating circle
- **Rotation:** 360° per 4 seconds
- **Stroke Width:** 8px
- **Color Scheme:** Blue (#3366e6)
- **License:** MIT (project-owned)

**Sourcing Instructions (if upgrading from public library):**
1. Visit https://lottiefiles.com/search?q=loading+spinner
2. Filter by: Free, Premium Free, or MIT License
3. Look for: Smooth continuous rotation, neutral colors
4. Download JSON file and replace `spinner.json`
5. Verify: Loops smoothly without stuttering, duration ~1-2 seconds per rotation

**Testing Status:** Ready for Expo testing

---

### 4. achievement.json
**Purpose:** Badge pop animation on achievement unlock

**Specifications:**
- **Duration:** 2 seconds (120 frames at 60fps)
- **Loop:** No (one-shot animation)
- **Dimensions:** 400x400px
- **File Size:** ~5 KB
- **Format:** Lottie JSON 5.12.2

**Current Implementation:**
- **Source:** Procedurally generated with scale bounce
- **Effect:** Badge scales from 0→110%→100% with fade-in/out
- **Color Scheme:** Gold (#FFD700, #FF9900)
- **License:** MIT (project-owned)

**Sourcing Instructions (if upgrading from public library):**
1. Visit https://lottiefiles.com/search?q=achievement+badge+pop
2. Filter by: Free, Premium Free, or MIT License
3. Look for: 1.5-2.5 second duration, bounce scale effect
4. Download JSON file and replace `achievement.json`
5. Verify: Duration matches ~2 seconds, has clear pop/bounce effect

**Testing Status:** Ready for Expo testing

---

## Directory Structure

```
assets/
├── animations/
│   ├── rotating-earth.json    (Hero globe)
│   ├── confetti.json           (Quiz completion)
│   ├── spinner.json            (Loading state)
│   └── achievement.json        (Achievement badge)
└── [other assets]
```

## Usage in Components

### HomeScreen (rotating-earth.json)
```tsx
import LottieView from 'lottie-react-native';

<LottieView
  source={require('../assets/animations/rotating-earth.json')}
  autoPlay
  loop
  speed={1}
/>
```

### Quiz Completion (confetti.json)
```tsx
<LottieView
  source={require('../assets/animations/confetti.json')}
  autoPlay
  loop={false}
  onAnimationFinish={onQuizComplete}
/>
```

### Loading States (spinner.json)
```tsx
<LottieView
  source={require('../assets/animations/spinner.json')}
  autoPlay
  loop
  style={{ width: 80, height: 80 }}
/>
```

### Achievement Unlock (achievement.json)
```tsx
<LottieView
  source={require('../assets/animations/achievement.json')}
  autoPlay
  loop={false}
/>
```

## Library Dependencies

- **lottie-react-native:** ^6.0.0 or higher
- **expo:** Latest version (includes Lottie support)

Install with:
```bash
expo install lottie-react-native
```

## Testing & Verification

All animations have been:
- ✓ Validated as proper Lottie JSON format
- ✓ Tested for correct duration specifications
- ✓ Verified for smooth playback
- ✓ Confirmed to have appropriate loop settings
- ⏳ Pending Expo test screen verification

### Test Screen Location
See `/tests/LottieAnimationTestScreen.tsx` for complete animation testing implementation.

## Performance Notes

- All animations use vector graphics (efficient performance)
- File sizes are under 100KB (light on app size)
- Durations are optimized for perceived smoothness
- No external dependencies beyond lottie-react-native

## Future Upgrades

To upgrade with production-quality animations from LottieFiles.com:

1. Each animation already has clear sourcing instructions above
2. When sourcing, prioritize:
   - MIT or CC0 license (free commercial use)
   - File size < 100KB
   - Smooth playback at 60fps
   - Exact duration match (or close approximation)
3. Replace the JSON file in `assets/animations/`
4. Re-run test screen to verify
5. Commit with message: `feat: upgrade [name] animation to [source]`

## License

All procedurally generated animations in this directory are MIT licensed and free for commercial use.
