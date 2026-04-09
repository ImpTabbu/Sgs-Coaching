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
  // Initialize state from localStorage for instant offline access
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [isPending, setIsPending] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const name = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    return name && role ? { name, role } : null;
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          const profileRes = await firebaseService.getUserProfile(firebaseUser.uid);
          
          if (profileRes.success && profileRes.data) {
            if (profileRes.data.active) {
              const name = profileRes.data.name || firebaseUser.displayName || 'User';
              const role = profileRes.data.role || 'student';
              
              // Update localStorage with fresh data
              localStorage.setItem('username', name);
              localStorage.setItem('userRole', role);
              localStorage.setItem('isLoggedIn', 'true');
              
              setUser({ name, role });
              setIsLoggedIn(true);
              setIsPending(false);
            } else {
              // Account is inactive, must logout
              await firebaseService.logout();
              setIsLoggedIn(false);
              setIsPending(true);
              setUser(null);
            }
          } else {
            // Profile fetch failed (could be offline)
            // If we already have a session in localStorage, trust it for offline use
            const wasLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (wasLoggedIn) {
              console.log("Offline mode: Using cached session");
              setIsLoggedIn(true);
              setIsPending(false);
            } else {
              // Truly failed and no cache, logout
              await firebaseService.logout();
              setIsLoggedIn(false);
              setIsPending(false);
              setUser(null);
            }
          }
        } catch (error) {
          console.error("Auth state error:", error);
          // On error, if we have a cached session, keep it
          if (localStorage.getItem('isLoggedIn') === 'true') {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } else {
        // No firebase user, clear everything
        setIsLoggedIn(false);
        setIsPending(false);
        setUser(null);
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
