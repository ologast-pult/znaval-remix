import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

import firebaseConfig from '../../firebase-applet-config.json';

/**
 * Firebase initialization
 */
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  // Initialize Firebase ONLY ONCE
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  // Use firestoreDatabaseId from config if available
  db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export const rtdb = app ? getDatabase(app) : null;
export const storage = app ? getStorage(app) : null;
export const analytics = (app && typeof window !== 'undefined') ? isSupported().then(yes => yes ? getAnalytics(app!) : null) : Promise.resolve(null);

export { auth, db };
export default app;

/**
 * Error Handling Utilities
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  if (!auth) throw new Error('Firebase Auth not initialized');
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Example Auth Functions (Login/Register)
 */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  UserCredential 
} from 'firebase/auth';

export const loginUser = async (email: string, pass: string): Promise<UserCredential> => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  try {
    return await signInWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (email: string, pass: string): Promise<UserCredential> => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  try {
    return await createUserWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Example Firestore Write/Read
 */
import { 
  collection, 
  addDoc, 
  getDocs, 
  DocumentReference,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';

export const addProperty = async (propertyData: any): Promise<DocumentReference> => {
  if (!db) throw new Error('Firestore not initialized');
  try {
    return await addDoc(collection(db, 'properties'), {
      ...propertyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding property:', error);
    throw error;
  }
};

export const getProperties = async (): Promise<QuerySnapshot<DocumentData>> => {
  if (!db) throw new Error('Firestore not initialized');
  try {
    return await getDocs(collection(db, 'properties'));
  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
};
