import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  // `role` is only used on first login (server ignores it after that) —
  // applies the same way whether the sign-in method was email/password or Google.
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
          // Expected for a brand-new account before a role has been sent —
          // appUser stays null until signUp()/signInWithGoogle() completes.
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

  // `role` only matters if this Google account has never signed in before —
  // for a returning user the server ignores it and returns their existing record.
  const signInWithGoogle = async (role) => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    await loadSession(role);
  };

  const signOutUser = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, signIn, signUp, signInWithGoogle, signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}