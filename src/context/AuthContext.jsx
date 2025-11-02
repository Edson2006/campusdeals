import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { ensureUserProfile } from '../services/firestoreService';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  setUserProfileLocally: () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setProfile(null);
      return null;
    }
    const data = await ensureUserProfile(firebaseUser);
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return null;
    return loadProfile(user);
  }, [loadProfile, user]);

  const setUserProfileLocally = useCallback(
    async ({ displayName, photoURL }) => {
      if (!user) return;
      try {
        await updateProfile(user, {
          displayName,
          photoURL
        });
        await refreshProfile();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[AuthProvider] updateProfile error', error);
        }
      }
    },
    [refreshProfile, user]
  );

  const logout = useCallback(() => signOut(auth), []);

  const value = useMemo(
    () => ({ user, profile, loading, refreshProfile, setUserProfileLocally, logout }),
    [user, profile, loading, refreshProfile, setUserProfileLocally, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);
