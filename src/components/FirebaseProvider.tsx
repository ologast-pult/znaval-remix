import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface FirebaseContextType {
  user: User | null;
  isAuthReady: boolean;
  refreshUser: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  isAuthReady: false,
  refreshUser: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const refreshUser = async () => {
    if (auth?.currentUser) {
      try {
        await auth.currentUser.reload();
        // Force state update by creating a shallow copy with fresh properties
        setUser(auth.currentUser);
      } catch (err) {
        console.warn('Failed to refresh user:', err);
      }
    }
  };

  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, isAuthReady, refreshUser }}>
      {children}
    </FirebaseContext.Provider>
  );
};
