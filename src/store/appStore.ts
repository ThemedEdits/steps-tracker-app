// Global state management with Zustand
import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile } from '../firebase/auth';

interface TrackingSession {
  isActive: boolean;
  isPaused: boolean;
  startTime: number | null;
  elapsed: number;
  distance: number; // meters
  steps: number;
  calories: number;
  currentSpeed: number; // km/h
  avgSpeed: number;
  maxSpeed: number;
  pace: number; // seconds/km
  routePoints: Array<{ lat: number; lng: number; timestamp: number; speed?: number }>;
  activityType: 'run' | 'walk';
}

interface AppState {
  // Auth
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  
  // Tracking session
  session: TrackingSession;
  
  // UI
  sidebarOpen: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Session actions
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  updateSession: (data: Partial<TrackingSession>) => void;
}

const defaultSession: TrackingSession = {
  isActive: false,
  isPaused: false,
  startTime: null,
  elapsed: 0,
  distance: 0,
  steps: 0,
  calories: 0,
  currentSpeed: 0,
  avgSpeed: 0,
  maxSpeed: 0,
  pace: 0,
  routePoints: [],
  activityType: 'walk',
};

export const useAppStore = create<AppState>((set) => ({
  // Auth state
  user: null,
  profile: null,
  authLoading: true,
  
  // Session state
  session: defaultSession,
  
  // UI state
  sidebarOpen: false,
  
  // Auth actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  
  // Session actions
  startSession: () => set(state => ({
    session: {
      ...defaultSession,
      isActive: true,
      startTime: Date.now() - (state.session.elapsed * 1000),
    }
  })),
  
  pauseSession: () => set(state => ({
    session: {
      ...state.session,
      isPaused: true,
      isActive: false,
    }
  })),
  
  resumeSession: () => set(state => ({
    session: {
      ...state.session,
      isPaused: false,
      isActive: true,
      startTime: Date.now() - (state.session.elapsed * 1000),
    }
  })),
  
  resetSession: () => set({ session: defaultSession }),
  
  updateSession: (data) => set(state => ({
    session: { ...state.session, ...data }
  })),
}));
