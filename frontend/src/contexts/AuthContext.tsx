import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '@/types';
import { safeGetStorage, safeSetStorage, safeRemoveStorage } from '@/utils/cartLogic';

interface AuthContextType {
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isLoggedIn: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const handleSync = () => {
      const saved = safeGetStorage<UserAccount | null>('animora_current_user', null);
      setCurrentUser(saved);
    };

    handleSync();
    window.addEventListener('animora_user_sync', handleSync);
    return () => {
      window.removeEventListener('animora_user_sync', handleSync);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      safeSetStorage('animora_current_user', currentUser);
    }
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    safeRemoveStorage('animora_current_user');
    window.dispatchEvent(new Event('animora_user_sync'));
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoggedIn: Boolean(currentUser), logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
