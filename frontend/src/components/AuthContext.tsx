import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services';
import { SESSION_EXPIRED_EVENT } from '../lib/api-client';
import { toast } from 'sonner';

export type UserRole = 'doctor' | 'nurse' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinicId: string;
  clinicName: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for session expiry events from API client
  useEffect(() => {
    const handleSessionExpired = (event: CustomEvent) => {
      const message = event.detail?.message || 'Your session has expired';
      
      // Show toast notification
      toast.warning(message, {
        duration: 5000,
        description: 'Please sign in again to continue',
      });
      
      // Clear user state
      setUser(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired as EventListener);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired as EventListener);
    };
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
        } catch (error) {
          // Token might be expired or invalid
          authApi.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Session heartbeat - check session validity periodically
  // With 0.5 min (30 sec) timeout, check every 15 seconds
  // With 20 min timeout, check every 60 seconds (1 minute)
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Starting session heartbeat (checking every 10 seconds)');

    // Adjust heartbeat frequency based on expected timeout
    // For testing (30 sec timeout): check every 10 seconds
    // For production (20 min timeout): check every 60 seconds
    const heartbeatInterval = setInterval(async () => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`💓 [${timestamp}] Heartbeat: Checking session validity (won't refresh session)...`);
      
      try {
        // Ping the /auth/me endpoint to validate session
        // Use getMeHeartbeat to NOT refresh the session
        await authApi.getMeHeartbeat();
        console.log(`✅ [${timestamp}] Heartbeat: Session valid`);
      } catch (error) {
        // Session expired - event listener will handle toast and redirect
        console.log(`❌ [${timestamp}] Heartbeat: Session validation failed -`, error);
      }
    }, 10000); // Check every 10 seconds for testing (change to 60000 for production)

    return () => {
      console.log('🛑 Stopping session heartbeat');
      clearInterval(heartbeatInterval);
    };
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
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
