/**
 * Firebase Client SDK Configuration
 * Client-side Firebase initialization for authentication
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User
} from 'firebase/auth';

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;

/**
 * Firebase client configuration from environment variables
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase Client SDK
 */
export function initializeFirebaseClient(): FirebaseApp {
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    return firebaseApp;
  }

  try {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('✅ Firebase Client SDK initialized');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase Client initialization error:', error);
    throw error;
  }
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseClientAuth(): Auth {
  if (!firebaseAuth) {
    const app = initializeFirebaseClient();
    firebaseAuth = getAuth(app);
  }
  return firebaseAuth;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const auth = getFirebaseClientAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return { user: userCredential.user, token };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Authentication failed');
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  const auth = getFirebaseClientAuth();
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current user's ID token
 */
export async function getCurrentUserToken(): Promise<string | null> {
  const auth = getFirebaseClientAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }

  try {
    const token = await user.getIdToken(true); // Force refresh
    return token;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getFirebaseClientAuth();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  const auth = getFirebaseClientAuth();
  return auth.currentUser;
}

// Export Firebase types
export type { User, Auth } from 'firebase/auth';
