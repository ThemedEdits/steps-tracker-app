// Firebase authentication service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./config";

// Sign up with email/password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in with Google — uses redirect (avoids COOP popup issues)
export const signInWithGoogle = async () => {
  try {
    // Try popup first (works in most environments)
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    // If blocked by COOP/browser policy, fall back to redirect flow
    if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, googleProvider);
      return null; // Page will redirect and return via getRedirectResult
    }
    throw err;
  }
};

// Call this once on app load to handle redirect result after Google sign-in
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch {
    return null;
  }
};

// Sign out
export const signOutUser = async () => {
  await signOut(auth);
};

// Create or update user profile in Firestore
export const createUserProfile = async (
  user: User,
  profileData: Partial<UserProfile>
) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || profileData.name || "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      totalDistance: 0,
      totalSteps: 0,
      totalCalories: 0,
      maxSpeed: 0,
      totalActivities: 0,
      profileComplete: false,
      ...profileData,
    });
  }

  return userRef;
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

// Update user profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, data, { merge: true });
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  gender?: 'male' | 'female' | 'other';
  bodyType?: 'slim' | 'average' | 'athletic' | 'heavy';
  fitnessGoal?: 'weight_loss' | 'endurance' | 'fitness' | 'casual';
  profileComplete: boolean;
  createdAt?: unknown;
  totalDistance: number;
  totalSteps: number;
  totalCalories: number;
  maxSpeed: number;
  totalActivities: number;
}