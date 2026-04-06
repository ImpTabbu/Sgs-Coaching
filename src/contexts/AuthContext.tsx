import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../lib/firebase';
import { firebaseService } from '../services/firebaseService';

interface User {
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isPending: boolean;
  authLoading: boolean;
  isAuthReady: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        const profileRes = await firebaseService.getUserProfile(firebaseUser.uid);
        if (profileRes.success && profileRes.data) {
          if (profileRes.data.active) {
            const name = profileRes.data.name || firebaseUser.displayName || 'User';
            const role = profileRes.data.role || 'student';
            localStorage.setItem('username', name);
            localStorage.setItem('userRole', role);
            localStorage.setItem('isLoggedIn', 'true');
            setUser({ name, role });
            setIsLoggedIn(true);
            setIsPending(false);
          } else {
            setIsLoggedIn(false);
            setIsPending(true);
          }
        } else {
          await firebaseService.logout();
          setIsLoggedIn(false);
          setIsPending(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsPending(false);
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
      }
      setAuthLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseService.logout();
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isPending, authLoading, isAuthReady, logout }}>
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
