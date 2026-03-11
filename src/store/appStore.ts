// Global state management with Zustand
import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile } from '../firebase/auth';

export interface TrackingSession {
  isActive:    boolean;
  isPaused:    boolean;
  startTime:   number | null;
  elapsed:     number;    // seconds
  distance:    number;    // meters
  steps:       number;
  calories:    number;
  currentSpeed: number;  // km/h
  avgSpeed:    number;   // km/h
  maxSpeed:    number;   // km/h
  pace:        number;   // seconds/km
  routePoints: Array<{ lat: number; lng: number; timestamp: number; speed?: number }>;
  activityType: 'run' | 'walk';
}

interface AppState {
  user:        User | null;
  profile:     UserProfile | null;
  authLoading: boolean;
  session:     TrackingSession;
  sidebarOpen: boolean;

  setUser:        (user: User | null) => void;
  setProfile:     (profile: UserProfile | null) => void;
  setAuthLoading: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;

  startSession:   () => void;
  pauseSession:   () => void;
  resumeSession:  () => void;
  resetSession:   () => void;
  // Functional updater — avoids stale closure problems
  updateSession:  (data: Partial<TrackingSession>) => void;
}

export const defaultSession: TrackingSession = {
  isActive:     false,
  isPaused:     false,
  startTime:    null,
  elapsed:      0,
  distance:     0,
  steps:        0,
  calories:     0,
  currentSpeed: 0,
  avgSpeed:     0,
  maxSpeed:     0,
  pace:         0,
  routePoints:  [],
  activityType: 'walk',
};

export const useAppStore = create<AppState>((set) => ({
  user:        null,
  profile:     null,
  authLoading: true,
  session:     defaultSession,
  sidebarOpen: false,

  setUser:        (user)        => set({ user }),
  setProfile:     (profile)     => set({ profile }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  startSession: () => set({
    session: {
      ...defaultSession,
      isActive:  true,
      startTime: Date.now(),
    }
  }),

  pauseSession: () => set(s => ({
    session: { ...s.session, isActive: false, isPaused: true }
  })),

  resumeSession: () => set(s => ({
    session: {
      ...s.session,
      isActive:  true,
      isPaused:  false,
      // Rebase startTime so elapsed continues correctly
      startTime: Date.now() - (s.session.elapsed * 1000),
    }
  })),

  resetSession: () => set({ session: defaultSession }),

  // Uses functional updater form so it always merges into the latest state,
  // even if called from a stale closure inside the GPS callback
  updateSession: (data) => set(s => ({
    session: { ...s.session, ...data }
  })),
}));