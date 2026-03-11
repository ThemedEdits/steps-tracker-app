// Firestore activities and stats service
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./config";

export interface Activity {
  id?: string;
  userId: string;
  type: 'run' | 'walk';
  distance: number; // meters
  steps: number;
  calories: number;
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  duration: number; // seconds
  pace: number; // min/km
  routePoints?: RoutePoint[];
  createdAt?: unknown;
  date?: string; // ISO string for easy filtering
}

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
  altitude?: number;
}

// Save an activity
export const saveActivity = async (activity: Activity): Promise<string> => {
  const activitiesRef = collection(db, "activities");
  const docRef = await addDoc(activitiesRef, {
    ...activity,
    createdAt: serverTimestamp(),
    date: new Date().toISOString().split('T')[0],
  });

  // Update user stats
  await updateDoc(doc(db, "users", activity.userId), {
    totalDistance: increment(activity.distance),
    totalSteps: increment(activity.steps),
    totalCalories: increment(activity.calories),
    totalActivities: increment(1),
  });

  // Update max speed if needed - done separately
  const userDoc = await getDoc(doc(db, "users", activity.userId));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    if (activity.maxSpeed > (userData.maxSpeed || 0)) {
      await updateDoc(doc(db, "users", activity.userId), {
        maxSpeed: activity.maxSpeed,
      });
    }
  }

  return docRef.id;
};

// Get user activities (paginated)
export const getUserActivities = async (
  userId: string,
  limitCount = 20
): Promise<Activity[]> => {
  const q = query(
    collection(db, "activities"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity));
};

// Get single activity
export const getActivity = async (activityId: string): Promise<Activity | null> => {
  const docSnap = await getDoc(doc(db, "activities", activityId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Activity;
  }
  return null;
};

// Get activities for a specific week
export const getWeeklyActivities = async (userId: string): Promise<Activity[]> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split('T')[0];

  const q = query(
    collection(db, "activities"),
    where("userId", "==", userId),
    where("date", ">=", dateStr),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity));
};

// Get today's summary
export const getTodayActivities = async (userId: string): Promise<Activity[]> => {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, "activities"),
    where("userId", "==", userId),
    where("date", "==", today)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity));
};
