import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  checkUserExists: (mobileNumber: string) => Promise<{ success: boolean; userExists: boolean; message: string }>;
  login: (mobileNumber: string, pin: string) => Promise<{ success: boolean; message: string }>;
  register: (mobileNumber: string, name: string, pin: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  changePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'customers', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              name: userData.name,
              mobileNumber: userData.mobileNumber,
              role: 'CUSTOMER'
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getEmailFromMobile = (mobile: string) => `${mobile}@positeasy.com`;

  const checkUserExists = async (mobileNumber: string) => {
    try {
      const q = query(collection(db, 'customers'), where('mobileNumber', '==', mobileNumber));
      const querySnapshot = await getDocs(q);
      return { 
        success: true, 
        userExists: !querySnapshot.empty, 
        message: '' 
      }; 
    } catch (error: any) {
      console.error('Error checking user existence:', error);
      return { success: false, userExists: false, message: error.message || 'Error checking user.' };
    }
  };

  const login = async (mobileNumber: string, pin: string) => {
    try {
      const email = getEmailFromMobile(mobileNumber);
      const userCredential = await signInWithEmailAndPassword(auth, email, pin);
      const firebaseUser = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'customers', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const loggedUser = {
          id: firebaseUser.uid,
          name: userData.name,
          mobileNumber: userData.mobileNumber,
          role: 'CUSTOMER'
        };
        setUser(loggedUser);
        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: 'User data not found.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (mobileNumber: string, name: string, pin: string) => {
    try {
      const email = getEmailFromMobile(mobileNumber);
      const userCredential = await createUserWithEmailAndPassword(auth, email, pin);
      const firebaseUser = userCredential.user;
      
      await setDoc(doc(db, 'customers', firebaseUser.uid), {
        name,
        mobileNumber,
        uid: firebaseUser.uid,
        createdAt: new Date(),
        role: 'CUSTOMER'
      });

      const newUser = {
        id: firebaseUser.uid,
        name,
        mobileNumber,
        role: 'CUSTOMER'
      };
      setUser(newUser);
      return { success: true, message: 'Registration successful' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const changePin = async (currentPin: string, newPin: string) => {
    return { success: false, message: 'PIN changing not yet implemented' };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, checkUserExists, login, register, logout, changePin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
