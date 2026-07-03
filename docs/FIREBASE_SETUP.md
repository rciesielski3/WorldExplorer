# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project called "WorldExplorer"
3. Enable Firestore Database (production mode)
4. Enable Authentication (if using user accounts)

## 2. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your Firebase config values from Firebase Console → Project Settings → Web App Configuration:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

These use the `EXPO_PUBLIC_` prefix so Expo inlines them into the client
bundle at build time (see `firebase-config.ts`). If `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
is left unset, the app logs a warning and runs in offline-only mode instead
of crashing.

## 3. Seed Historical Facts

For local development:
```bash
# Download service account key from Firebase Console → Project Settings → Service Accounts
# Save as `firebase-service-account.json` (already covered by .gitignore's *.json rule
# for credentials - do not commit this file)
export FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
npm run firebase:seed
```

This runs `scripts/firebase/seed-facts.ts`, which reads `data/historicalFacts.json`
and writes each country's facts to `countries/{countryCode}/facts/data` in Firestore
using the Firebase Admin SDK.

## 4. Deploy Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

`firestore.rules` (at the repo root) allows public read access to
`countries/{country}` and `countries/{country}/facts/**`, and restricts
`users/{userId}` (and their `favorites` subcollection) to the authenticated
owner. All other paths are denied by default.

## 5. (Optional) Use Firebase Emulator Locally

```bash
firebase emulators:start
npm run firebase:emulator
```

Set `FIREBASE_EMULATOR_HOST=localhost:8080` in `.env` to have the app's
Firestore/Auth clients connect to the local emulator instead of production
Firebase (see the `__DEV__` + `FIREBASE_EMULATOR_HOST` check in
`firebase-config.ts`).
