import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { logger } from './utils/logger';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate required config before initializing Firebase
const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain &&
  firebaseConfig.appId
);

if (!isConfigured) {
  logger.warn('Firebase configuration incomplete - offline mode only', {
    context: 'firebase-config',
    timestamp: new Date().toISOString(),
    metadata: {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      hasAuthDomain: !!firebaseConfig.authDomain,
      hasAppId: !!firebaseConfig.appId,
    },
  });
}

let app: any;
let db: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  logger.error('Failed to initialize Firebase', {
    context: 'firebase-config',
    timestamp: new Date().toISOString(),
    metadata: {
      error: error instanceof Error ? error.message : String(error),
    },
  });
  // Create placeholder objects to prevent crashes downstream
  app = null;
  db = null;
  auth = null;
}

export { app, db, auth };

// Connect to emulator in development (if FIREBASE_EMULATOR_HOST env var set)
if (process.env.FIREBASE_EMULATOR_HOST && __DEV__) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    logger.info('Connected to Firebase emulators', {
      context: 'firebase-config',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Emulator already connected or unavailable - ignore
  }
}

export default app;
