import { doc, setDoc, increment, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

let pendingReads = 0;
let pendingWrites = 0;
let syncTimeout: any = null;

export function trackUsage(reads: number, writes: number) {
  pendingReads += reads;
  pendingWrites += writes;
  
  if (!syncTimeout) {
    syncTimeout = setTimeout(syncUsage, 5000); // 5s debounce
  }
}

async function syncUsage() {
  if (pendingReads === 0 && pendingWrites === 0) return;
  
  const readsToSync = pendingReads;
  const writesToSync = pendingWrites;
  
  pendingReads = 0;
  pendingWrites = 0;
  syncTimeout = null;
  
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const ref = doc(db, 'system_metrics', `usage_${today}`);
    
    await setDoc(ref, {
      totalReads: increment(readsToSync),
      totalWrites: increment(writesToSync),
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
  } catch (error) {
    console.error('Failed to sync usage tracking', error);
  }
}

export async function getUsageStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const ref = doc(db, 'system_metrics', `usage_${today}`);
    const snap = await getDoc(ref);
    
    trackUsage(1, 0);

    if (snap.exists()) {
      return snap.data() as { totalReads: number; totalWrites: number; lastUpdated: string };
    }
    return { totalReads: 0, totalWrites: 0, lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error('Error fetching usage stats', error);
    return { totalReads: 0, totalWrites: 0, lastUpdated: new Date().toISOString() };
  }
}

export async function getHistoricalUsageStats(days: number = 7) {
  try {
    const history = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const ref = doc(db, 'system_metrics', `usage_${dateStr}`);
      const snap = await getDoc(ref);
      
      if (snap.exists()) {
        const data = snap.data();
        history.push({
          date: dateStr.split('-').slice(1).join('/'), // MM/DD
          reads: data.totalReads || 0,
          writes: data.totalWrites || 0
        });
      } else {
        history.push({
          date: dateStr.split('-').slice(1).join('/'),
          reads: 0,
          writes: 0
        });
      }
    }
    
    trackUsage(days, 0);
    return history;
  } catch (error) {
    console.error('Error fetching historical usage stats', error);
    return [];
  }
}

export async function getSystemDocumentStats() {
  try {
    const collections = ['users', 'products', 'shipments', 'alerts', 'sample_requests', 'config'];
    const stats: Record<string, { count: number, sizeBytes: number }> = {};
    let totalReads = 0;

    for (const col of collections) {
      const snap = await getDocs(collection(db, col));
      let sizeBytes = 0;
      snap.forEach(doc => {
        sizeBytes += doc.id.length + JSON.stringify(doc.data()).length;
      });
      
      stats[col] = {
        count: snap.size,
        sizeBytes: sizeBytes
      };
      totalReads += snap.size;
    }

    trackUsage(totalReads, 0);
    return stats;
  } catch (error) {
    console.error('Error counting documents', error);
    return {};
  }
}
