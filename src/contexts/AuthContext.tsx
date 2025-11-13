import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, Profile } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const googleProvider = new GoogleAuthProvider();
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadProfile(user.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const profileData: Profile = {
      id: userCredential.user.uid,
      email,
      display_name: displayName,
      has_subscription: false,
      subscription_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await setDoc(doc(db, 'profiles', userCredential.user.uid), profileData);
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      const docRef = doc(db, 'profiles', userCredential.user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const profileData: Profile = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          display_name: userCredential.user.displayName || 'User',
          has_subscription: false,
          subscription_expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDoc(docRef, profileData);
      }

      // Espera a que Firebase actualice el estado antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
