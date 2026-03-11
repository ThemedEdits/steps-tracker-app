// Custom hook for authentication with Firebase
import { useEffect } from 'react';
import { onAuthChange, getUserProfile, createUserProfile, handleRedirectResult } from '../firebase/auth';
import { useAppStore } from '../store/appStore';

export const useAuth = () => {
  const { user, profile, authLoading, setUser, setProfile, setAuthLoading } = useAppStore();

  useEffect(() => {
    // Handle Google redirect result (fires after redirect sign-in returns)
    handleRedirectResult().catch(console.error);

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Ensure user document exists in Firestore
          await createUserProfile(firebaseUser, {
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
          });
          
          // Fetch profile
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setAuthLoading]);

  return { user, profile, authLoading };
};