import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK using service account
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_PATH not set in .env');
  console.error('Set it to path of your Firebase service account JSON file');
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf-8')
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

async function seedHistoricalFacts() {
  try {
    console.log('📚 Loading historical facts data...');
    const factsPath = path.join(__dirname, '../../data/historicalFacts.json');
    const factsData = JSON.parse(fs.readFileSync(factsPath, 'utf-8'));

    console.log('🔥 Seeding Firestore with historical facts...');
    let count = 0;

    for (const [countryCode, facts] of Object.entries(factsData.facts)) {
      const docRef = db.collection('countries').doc(countryCode).collection('facts').doc('data');
      await docRef.set({
        facts: facts,
        lastUpdated: new Date(),
      });
      count++;
      console.log(`✅ Seeded ${countryCode}`);
    }

    console.log(`\n✨ Successfully seeded ${count} countries' historical facts!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding historical facts:', error);
    process.exit(1);
  }
}

seedHistoricalFacts();
