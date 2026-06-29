# Local Build Guide - WorldExplorer v1.1.0

**Guide for building Android App Bundle (AAB) locally when EAS Build is unavailable**

---

## Prerequisites

### Required Software
- **Node.js** 18+: `node --version`
- **npm** 9+: `npm --version`
- **Android SDK**: Installed and configured
- **Java JDK** 11+: `java -version`
- **Android Build Tools** 33+

### Environment Setup

```bash
# Check if Android SDK is installed
ls ~/Library/Android/sdk/build-tools/

# Verify Java installation
java -version

# Check Node/npm
node --version
npm --version
```

### GitHub Credentials

Ensure you have:
- Git SSH key configured
- GitHub access to rciesielski3/WorldExplorer
- Correct git user configured:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your-email@example.com"
  ```

---

## Step-by-Step Build Instructions

### Step 1: Prepare the Repository

```bash
# Clone or update repository
git clone git@github.com:rciesielski3/WorldExplorer.git
cd WorldExplorer

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Verify version
grep '"version"' app.json
```

### Step 2: Install Dependencies

```bash
# Install npm packages
npm ci

# Verify installation
npm list | head -20
```

Expected: All dependencies installed without errors

### Step 3: Configure Android Build

The app is configured to use EAS signing by default. To build locally:

#### Option A: Using Stored Keystore (Recommended)

1. **Locate keystore file:**
   ```bash
   # Check for keystore in credentials
   ls -la credentials/ | grep -i key
   ```

2. **Set keystore properties:**
   ```bash
   # Create android/key.properties with:
   # storeFile=../../credentials/android/keystore.jks
   # storePassword=[PASSWORD_FROM_CREDENTIALS]
   # keyAlias=[KEY_ALIAS_FROM_CREDENTIALS]
   # keyPassword=[KEY_PASSWORD_FROM_CREDENTIALS]
   ```

3. **Verify signing config:**
   ```bash
   # Check android/app/build.gradle has release signing configured
   grep -A 5 "signingConfigs {" android/app/build.gradle
   ```

#### Option B: Create New Local Keystore (For testing only, NOT for production)

```bash
# Generate new keystore (DO NOT USE FOR PRODUCTION)
keytool -genkey -v -keystore android/app/release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release -storepass android -keypass android

# Set keystore file location in android/app/build.gradle
# CRITICAL: Use production keystore SHA1 from credentials, not this test keystore
```

### Step 4: Build AAB Locally

```bash
# Navigate to android directory
cd android

# Clean build
./gradlew clean

# Build release AAB
./gradlew bundleRelease

# Expected output location:
# android/app/build/outputs/bundle/release/app-release.aab

# Verify file exists
ls -lh android/app/build/outputs/bundle/release/app-release.aab
```

Expected size: ~22MB

### Step 5: Verify Build Signing

Verify the AAB is signed with the correct certificate:

```bash
# Extract signing certificate info
jarsigner -verify -verbose -certs \
  android/app/build/outputs/bundle/release/app-release.aab

# You should see the certificate SHA1 matching:
# SHA1: 34:C6:3A:57:7B:3C:06:5F:B3:5D:18:C6:65:E3:B6:6B:3A:29:F9:5F
```

**CRITICAL:** If SHA1 doesn't match, the app will be rejected by Play Store.

### Step 6: Prepare for Upload

```bash
# Copy AAB to upload location
mkdir -p ~/Downloads/WorldExplorer-Builds/
cp android/app/build/outputs/bundle/release/app-release.aab \
   ~/Downloads/WorldExplorer-Builds/WorldExplorer-v1.1.0-release.aab

# Verify file
ls -lh ~/Downloads/WorldExplorer-Builds/WorldExplorer-v1.1.0-release.aab
```

---

## Upload to Google Play Console

### Step 1: Log In to Play Console

1. Navigate to: https://play.google.com/console
2. Select "WorldExplorer" project
3. Go to: Releases → Production

### Step 2: Create New Release

1. Click "Create New Release"
2. Upload AAB file: `WorldExplorer-v1.1.0-release.aab`
3. Wait for verification (usually 1-2 minutes)

### Step 3: Add Release Notes

1. Copy content from: `STORE_RELEASE_NOTES.md`
2. Paste into "Release Notes" field
3. Ensure proper formatting

### Step 4: Review & Rollout

1. Review all app details
2. Confirm testing checklist completed
3. Click "Review Release"
4. Then "Start Rollout to Production"

### Step 5: Monitor Submission

1. Track status in Play Console
2. Google will review and approve (usually 2-4 hours)
3. Monitor for any rejection reasons
4. App appears in Play Store within 24 hours of approval

---

## Troubleshooting

### Build Fails: "Keystore file not found"

**Solution:**
```bash
# Verify keystore location
ls -la credentials/android/keystore.jks

# Update android/key.properties with absolute path
storeFile=/full/path/to/credentials/android/keystore.jks
```

### Build Fails: "Invalid signing certificate"

**Solution:**
```bash
# Check certificate SHA1
keytool -list -v -keystore android/app/release.keystore

# Must match: 34:C6:3A:57:7B:3C:06:5F:B3:5D:18:C6:65:E3:B6:6B:3A:29:F9:5F

# If doesn't match, use production keystore from credentials/
```

### Build Fails: "Build tools version not found"

**Solution:**
```bash
# List installed build tools
ls ~/Library/Android/sdk/build-tools/

# Update android/build.gradle to use installed version:
# buildToolsVersion = "33.0.0" (or latest installed)
```

### Play Store Rejects: "Package not signed with upload key"

**Solution:**
1. Verify keystore SHA1 matches expected value
2. Check key.properties points to correct keystore
3. Clear gradle cache: `./gradlew clean`
4. Rebuild with correct keystore

### App Not Appearing After Upload

**Common Causes:**
- Upload still being reviewed (wait 2-4 hours)
- Certificate mismatch (re-check signing)
- Version code conflict (check existing releases)
- Content rating not set (set in Console)

---

## Post-Upload Monitoring

### First 24 Hours

- Monitor for crash reports
- Check Play Store reviews
- Verify offline functionality with downloads
- Monitor app analytics

### Commands to Check Build Status

```bash
# View build output log
cat android/app/build.outputs.txt 2>/dev/null

# Check gradle version
./gradlew --version

# View signing certificate details
keytool -list -v -keystore [keystore-path]
```

---

## Important Notes

### Production Safety

🔴 **CRITICAL:**
- Use ONLY the production keystore from `credentials/`
- Never create test keystores for production builds
- Verify SHA1 matches before uploading
- Keep keystore file secure and backed up

### Version Management

- Current version: 1.1.0
- Each upload must have unique version code
- Version code increments automatically in Play Console
- Update app.json version for next release

### Data Stability

- All 250 countries included in build
- Monthly dataset updates via GitHub Actions
- No external API calls (data bundled)
- Offline functionality verified before build

---

## Quick Reference: Build Command

```bash
# One-line build command
cd android && ./gradlew bundleRelease && \
  echo "✅ Build complete: android/app/build/outputs/bundle/release/app-release.aab"
```

---

## Support & Troubleshooting

If build fails:
1. Run `./gradlew clean`
2. Delete `.gradle/` directory
3. Verify all prerequisites installed
4. Check keystore file exists and is valid
5. Review build output for specific error message

**Build time:** 5-15 minutes (first build slower)

**Expected result:** `app-release.aab` (~22MB)

---

**v1.1.0 Ready to Build Locally** ✅
