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

    // If the profile is empty, assume this is a fresh database and seed initial data
    if (profileEmpty) {
      console.log('Firestore profile is empty. Seeding initial data...');
      const batch = writeBatch(db);

      // Seed Company Profile only, we do not want dummy products/users anymore
      const profileRef = doc(db, CONFIG_COL, PROFILE_DOC_ID);
      batch.set(profileRef, defaultProfile);

      // Commit the batch seed
      await batch.commit();
      console.log('Firestore seeding completed successfully.');

      return {
        users: [],
        products: [],
        shipments: [],
        alerts: [],
        sampleRequests: [],
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
    // Fallback to empty data instead of mocks
    return {
      users: [],
      products: [],
      shipments: [],
      alerts: [],
      sampleRequests: [],
      companyProfile: defaultProfile
    };
  }
}

// Single item persistence helpers
export async function saveUserToFirestore(user: UserProfile) {
  try {
    // Remove undefined fields before saving
    const sanitizedData = Object.fromEntries(Object.entries(user).filter(([_, v]) => v !== undefined));
    await setDoc(doc(db, USERS_COL, user.id), sanitizedData);
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
    const sanitizedProduct = Object.fromEntries(Object.entries(product).filter(([_, v]) => v !== undefined));
    await setDoc(doc(db, PRODUCTS_COL, product.id), sanitizedProduct);
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
  }
}

export async function saveShipmentToFirestore(shipment: ExportShipment) {
  try {
    // Remove undefined fields before saving
    const sanitizedData = Object.fromEntries(Object.entries(shipment).filter(([_, v]) => v !== undefined));
    await setDoc(doc(db, SHIPMENTS_COL, shipment.id), sanitizedData);
  } catch (error) {
    console.error('Error saving shipment to Firestore:', error);
  }
}

export async function saveAlertToFirestore(alert: RealTimeAlert) {
  try {
    // Remove undefined fields before saving
    const sanitizedData = Object.fromEntries(Object.entries(alert).filter(([_, v]) => v !== undefined));
    await setDoc(doc(db, ALERTS_COL, alert.id), sanitizedData);
  } catch (error) {
    console.error('Error saving alert to Firestore:', error);
  }
}

export async function saveSampleRequestToFirestore(request: any) {
  try {
    // Remove undefined fields before saving
    const sanitizedData = Object.fromEntries(Object.entries(request).filter(([_, v]) => v !== undefined));
    await setDoc(doc(db, SAMPLE_REQS_COL, request.id), sanitizedData);
  } catch (error) {
    console.error('Error saving sample request to Firestore:', error);
  }
}

export async function saveCompanyProfileToFirestore(profile: any) {
  try {
    // Remove undefined fields before saving
    const sanitizedData = Object.fromEntries(Object.entries(profile).filter(([_, v]) => v !== undefined));
    await setDoc(doc(db, CONFIG_COL, PROFILE_DOC_ID), sanitizedData);
  } catch (error) {
    console.error('Error saving company profile to Firestore:', error);
  }
}
