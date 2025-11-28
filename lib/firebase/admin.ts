/**
 * Firebase Admin SDK Configuration
 * Server-side Firebase initialization for authentication and Firestore
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

/**
 * Initialize Firebase Admin SDK
 * Singleton pattern to prevent multiple initializations
 */
export function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    return { app: adminApp, auth: adminAuth, db: adminDb };
  }

  try {
    // Initialize with environment variables
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

    console.log('✅ Firebase Admin SDK initialized successfully');
    
    return { app: adminApp, auth: adminAuth, db: adminDb };
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw error;
  }
}

/**
 * Get Firebase Admin Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!adminAuth) {
    const { auth } = initializeFirebaseAdmin();
    adminAuth = auth;
  }
  return adminAuth;
}

/**
 * Get Firestore Admin instance
 */
export function getFirebaseDb(): Firestore {
  if (!adminDb) {
    const { db } = initializeFirebaseAdmin();
    adminDb = db;
  }
  return adminDb;
}

/**
 * Verify Firebase ID Token
 * @param idToken - Firebase ID token from client
 * @returns Decoded token with user information
 */
export async function verifyIdToken(idToken: string) {
  const auth = getFirebaseAuth();
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Get user by UID
 * @param uid - Firebase user UID
 */
export async function getUserByUid(uid: string) {
  const auth = getFirebaseAuth();
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Create custom token for user
 * @param uid - Firebase user UID
 * @param additionalClaims - Custom claims to include
 */
export async function createCustomToken(
  uid: string, 
  additionalClaims?: Record<string, any>
) {
  const auth = getFirebaseAuth();
  try {
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
}

/**
 * Set custom user claims (roles, permissions)
 * @param uid - Firebase user UID
 * @param claims - Custom claims object
 */
export async function setUserClaims(uid: string, claims: Record<string, any>) {
  const auth = getFirebaseAuth();
  try {
    await auth.setCustomUserClaims(uid, claims);
    return true;
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
}

// Export types
export type { Auth, DecodedIdToken } from 'firebase-admin/auth';
export type { Firestore } from 'firebase-admin/firestore';
