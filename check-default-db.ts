import { db } from './src/lib/firebase';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase-applet-config.json';

async function check() {
  const app = initializeApp(firebaseConfig);
  // get default db
  const defaultDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
  try {
    await getDocFromServer(doc(defaultDb, 'test', 'connection'));
    console.log('Database is accessible!');
  } catch (e) {
    console.log('Database error:', e.message);
  }
  process.exit(0);
}
check();
