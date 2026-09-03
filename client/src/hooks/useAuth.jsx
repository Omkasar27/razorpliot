import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebaseClient.js';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Exchanges the current Firebase session for the app's own User record.
  // `role` is only used on first login (server ignores it after that).
  const loadSession = useCallback(async (role) => {
    const { user } = await api.post('/auth/session', role ? { role } : {});
    setAppUser(user);
    return user;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          await loadSession();
        } catch {
          // Expected for a brand-new Firebase account before signUp() has
          // sent a role — appUser stays null until that completes.
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadSession]);

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signUp = async (email, password, role) => {
    await createUserWithEmailAndPassword(auth, email, password);
    await loadSession(role); // creates the app User (+ Merchant, if applicable) on first login
  };

  const signOutUser = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, signIn, signUp, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}