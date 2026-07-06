import { db } from './src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function check() {
  const users = await getDocs(collection(db, 'users'));
  console.log('Users count:', users.size);
  const products = await getDocs(collection(db, 'products'));
  console.log('Products count:', products.size);
  const shipments = await getDocs(collection(db, 'shipments'));
  console.log('Shipments count:', shipments.size);
  const config = await getDocs(collection(db, 'config'));
  console.log('Config count:', config.size);
  process.exit(0);
}
check();
