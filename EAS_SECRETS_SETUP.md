# EAS Build Secrets Configuration

This guide explains how to set up EAS Build environment variables (secrets) so that cloud builds receive the Firebase and API keys needed for the app to run.

## Why This Is Needed

The app requires these environment variables at build time:
- `EXPO_PUBLIC_FIREBASE_API_KEY` 
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `GOOGLE_MAPS_API_KEY`

When building locally, Expo reads these from `.env`. When building on EAS (cloud), `.env` is NOT uploaded, so you must configure EAS Secrets.

## Setup Steps

### 1. Create EAS Secrets (One-Time Setup)

Run this command to create secrets for each variable:

```bash
eas secret:create --scope project --name FIREBASE_API_KEY --value "YOUR_API_KEY_HERE"
eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "worldexplorer-21969.firebaseapp.com"
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "worldexplorer-21969"
eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value "worldexplorer-21969.firebasestorage.app"
eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value "330930495136"
eas secret:create --scope project --name FIREBASE_APP_ID --value "1:330930495136:android:7b4d2ad274813a4af873c5"
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "YOUR_MAPS_KEY_HERE"
```

Replace the `--value` parameters with actual values from:
- **Firebase**: Firebase Console → Project Settings → Web App Configuration
- **Google Maps**: Google Cloud Console → APIs & Services → Credentials

### 2. Verify Secrets Were Created

```bash
eas secret:list --scope project
```

You should see all 7 secrets listed.

### 3. Build with EAS

```bash
# Build for internal testing
eas build --platform android --profile internal

# Build for production (Play Store)
eas build --platform android --profile production
```

EAS automatically injects the secrets into the build environment based on the `env` configuration in `eas.json`.

## Troubleshooting

### "FirebaseError: Firebase: Error (auth/invalid-api-key)" after deployment

1. Check secrets exist: `eas secret:list --scope project`
2. Verify values match Firebase Console settings
3. Check `eas.json` has correct secret names (should match `@SECRET_NAME`)
4. Rebuild: `eas build --platform android --profile production --clear-cache`

### How to Update a Secret

```bash
eas secret:delete --scope project --name FIREBASE_API_KEY
eas secret:create --scope project --name FIREBASE_API_KEY --value "NEW_VALUE"
```

### Local Development

For local dev, make sure `.env` has all values (they're gitignored, so safe to commit locally).

## References

- [EAS Build: Environment Variables & Secrets](https://docs.expo.dev/build/variables/)
- [Firebase Console: Web App Configuration](https://console.firebase.google.com/)
- [Google Cloud Console: API Credentials](https://console.cloud.google.com/apis/credentials)
