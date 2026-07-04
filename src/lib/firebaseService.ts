import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, ExportProduct, ExportShipment, RealTimeAlert } from '../types';
import { mockUsers, mockProducts, initialShipments, initialAlerts, createMockDocuments, mockCertificationsList } from '../mockData';

// Collection references
const USERS_COL = 'users';
const PRODUCTS_COL = 'products';
const SHIPMENTS_COL = 'shipments';
const ALERTS_COL = 'alerts';
const SAMPLE_REQS_COL = 'sample_requests';
const CONFIG_COL = 'config';
const PROFILE_DOC_ID = 'company_profile';

export interface FirebaseData {
  users: UserProfile[];
  products: ExportProduct[];
  shipments: ExportShipment[];
  alerts: RealTimeAlert[];
  sampleRequests: any[];
  companyProfile: any;
}

// Check if a collection is empty
async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.empty;
  } catch (error) {
    console.error(`Error checking if ${collectionName} is empty:`, error);
    return true; // assume empty to trigger fallback/seed
  }
}

// Main initial fetch & seed function
export async function fetchAndSeedInitialData(defaultProfile: any, defaultSampleRequests: any[]): Promise<FirebaseData> {
  console.log('Fetching data from Firebase Firestore...');

  try {
    const usersEmpty = await isCollectionEmpty(USERS_COL);
    const productsEmpty = await isCollectionEmpty(PRODUCTS_COL);
    const shipmentsEmpty = await isCollectionEmpty(SHIPMENTS_COL);
    const alertsEmpty = await isCollectionEmpty(ALERTS_COL);
    const samplesEmpty = await isCollectionEmpty(SAMPLE_REQS_COL);
    const profileEmpty = await isCollectionEmpty(CONFIG_COL);

    // If any of the main data is empty, let's seed them so the app is immediately usable
    if (usersEmpty || productsEmpty || shipmentsEmpty || alertsEmpty || samplesEmpty || profileEmpty) {
      console.log('Firestore is empty or partially unseeded. Seeding initial data...');
      const batch = writeBatch(db);

      // Seed Users
      const initialUsers = mockUsers.map(u => ({ ...u, isApproved: true }));
      initialUsers.forEach(user => {
        const docRef = doc(db, USERS_COL, user.id);
        batch.set(docRef, user);
      });

      // Seed Products
      mockProducts.forEach(prod => {
        const docRef = doc(db, PRODUCTS_COL, prod.id);
        batch.set(docRef, prod);
      });

      // Seed Shipments
      const baseShipments = initialShipments();
      const initialShip = baseShipments.map(s => ({
        ...s,
        documents: createMockDocuments(s.id, s.totalValue, s.quantity, s.unit, s.productName, s.hsCode),
        certifications: mockCertificationsList(s.id)
      }));
      initialShip.forEach(ship => {
        const docRef = doc(db, SHIPMENTS_COL, ship.id);
        batch.set(docRef, ship);
      });

      // Seed Alerts
      initialAlerts.forEach(alert => {
        const docRef = doc(db, ALERTS_COL, alert.id);
        batch.set(docRef, alert);
      });

      // Seed Sample Requests
      defaultSampleRequests.forEach(req => {
        const docRef = doc(db, SAMPLE_REQS_COL, req.id);
        batch.set(docRef, req);
      });

      // Seed Company Profile
      const profileRef = doc(db, CONFIG_COL, PROFILE_DOC_ID);
      batch.set(profileRef, defaultProfile);

      // Commit the batch seed
      await batch.commit();
      console.log('Firestore seeding completed successfully.');

      return {
        users: initialUsers,
        products: mockProducts,
        shipments: initialShip,
        alerts: initialAlerts,
        sampleRequests: defaultSampleRequests,
        companyProfile: defaultProfile
      };
    }

    // Otherwise, fetch everything from Firestore
    console.log('Loading active records from Firestore...');
    const usersSnap = await getDocs(collection(db, USERS_COL));
    const productsSnap = await getDocs(collection(db, PRODUCTS_COL));
    const shipmentsSnap = await getDocs(collection(db, SHIPMENTS_COL));
    const alertsSnap = await getDocs(collection(db, ALERTS_COL));
    const samplesSnap = await getDocs(collection(db, SAMPLE_REQS_COL));
    const profileSnap = await getDocs(collection(db, CONFIG_COL));

    const users: UserProfile[] = [];
    usersSnap.forEach(doc => {
      users.push(doc.data() as UserProfile);
    });

    const products: ExportProduct[] = [];
    productsSnap.forEach(doc => {
      products.push(doc.data() as ExportProduct);
    });

    const shipments: ExportShipment[] = [];
    shipmentsSnap.forEach(doc => {
      shipments.push(doc.data() as ExportShipment);
    });

    const alerts: RealTimeAlert[] = [];
    alertsSnap.forEach(doc => {
      alerts.push(doc.data() as RealTimeAlert);
    });

    const sampleRequests: any[] = [];
    samplesSnap.forEach(doc => {
      sampleRequests.push(doc.data());
    });

    let companyProfile = defaultProfile;
    profileSnap.forEach(doc => {
      if (doc.id === PROFILE_DOC_ID) {
        companyProfile = doc.data();
      }
    });

    return {
      users,
      products,
      shipments,
      alerts,
      sampleRequests,
      companyProfile
    };
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    // Fallback to local storage or mocks
    return {
      users: mockUsers.map(u => ({ ...u, isApproved: true })),
      products: mockProducts,
      shipments: initialShipments().map(s => ({
        ...s,
        documents: createMockDocuments(s.id, s.totalValue, s.quantity, s.unit, s.productName, s.hsCode),
        certifications: mockCertificationsList(s.id)
      })),
      alerts: initialAlerts,
      sampleRequests: defaultSampleRequests,
      companyProfile: defaultProfile
    };
  }
}

// Single item persistence helpers
export async function saveUserToFirestore(user: UserProfile) {
  try {
    await setDoc(doc(db, USERS_COL, user.id), user);
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}

export async function deleteUserFromFirestore(userId: string) {
  try {
    await deleteDoc(doc(db, USERS_COL, userId));
  } catch (error) {
    console.error('Error deleting user from Firestore:', error);
  }
}

export async function deleteProductFromFirestore(productId: string) {
  try {
    await deleteDoc(doc(db, PRODUCTS_COL, productId));
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
  }
}

export async function saveProductToFirestore(product: ExportProduct) {
  try {
    await setDoc(doc(db, PRODUCTS_COL, product.id), product);
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
  }
}

export async function saveShipmentToFirestore(shipment: ExportShipment) {
  try {
    await setDoc(doc(db, SHIPMENTS_COL, shipment.id), shipment);
  } catch (error) {
    console.error('Error saving shipment to Firestore:', error);
  }
}

export async function saveAlertToFirestore(alert: RealTimeAlert) {
  try {
    await setDoc(doc(db, ALERTS_COL, alert.id), alert);
  } catch (error) {
    console.error('Error saving alert to Firestore:', error);
  }
}

export async function saveSampleRequestToFirestore(request: any) {
  try {
    await setDoc(doc(db, SAMPLE_REQS_COL, request.id), request);
  } catch (error) {
    console.error('Error saving sample request to Firestore:', error);
  }
}

export async function saveCompanyProfileToFirestore(profile: any) {
  try {
    await setDoc(doc(db, CONFIG_COL, PROFILE_DOC_ID), profile);
  } catch (error) {
    console.error('Error saving company profile to Firestore:', error);
  }
}
