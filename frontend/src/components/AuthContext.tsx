import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services';
import { SESSION_EXPIRED_EVENT, SESSION_REVOKED_EVENT } from '../lib/api-client';
import { toast } from 'sonner';

export type UserRole = 'doctor' | 'nurse' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinicId: string;
  clinicName: string;
  mcrNumber?: string; // Medical Council Registration number (for doctors)
  favoriteExamTypes?: string[]; // Array of favorite exam types
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

  // Listen for session expiry and revoked events from API client
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

    const handleSessionRevoked = (event: CustomEvent) => {
      const message = event.detail?.message || 'Your session has been revoked';
      
      // Show error notification with more prominent styling
      toast.error(message, {
        duration: 8000,
        description: 'You have logged in from another location',
      });
      
      // Clear user state
      setUser(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired as EventListener);
    window.addEventListener(SESSION_REVOKED_EVENT, handleSessionRevoked as EventListener);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired as EventListener);
      window.removeEventListener(SESSION_REVOKED_EVENT, handleSessionRevoked as EventListener);
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

  // User activity detection and session keep-alive
  useEffect(() => {
    if (!user) return;

    let lastActivityTime = Date.now();
    let sessionRefreshTimer: NodeJS.Timeout | null = null;
    let hasRecentActivity = false;

    // Track user activity (mouse, keyboard, touch)
    const updateActivity = () => {
      lastActivityTime = Date.now();
      hasRecentActivity = true;
    };

    // Activity event listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    console.log('🔄 Starting user activity detection and session keep-alive');

    // Check activity and refresh session every 2 minutes
    const checkAndRefresh = async () => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      const timestamp = new Date().toLocaleTimeString();

      if (hasRecentActivity) {
        // User was active - refresh the session
        console.log(`✨ [${timestamp}] User was active, refreshing session...`);
        hasRecentActivity = false;
        
        try {
          // Regular getMe call will refresh the session (not heartbeat)
          await authApi.getMe();
          console.log(`✅ [${timestamp}] Session refreshed due to user activity`);
        } catch (error) {
          console.log(`❌ [${timestamp}] Session refresh failed:`, error);
          // Session expired - event listener will handle toast and redirect
        }
      } else {
        // No activity - just check session validity without refreshing
        console.log(`💤 [${timestamp}] No recent activity (idle for ${Math.round(timeSinceActivity / 1000)}s), checking session validity...`);
        
        try {
          await authApi.getMeHeartbeat();
          console.log(`✅ [${timestamp}] Session still valid (heartbeat check)`);
        } catch (error) {
          console.log(`❌ [${timestamp}] Session validation failed:`, error);
        }
      }
    };

    // Run check every 2 minutes (120 seconds)
    // This means the session will be refreshed if user is active within any 2-minute window
    sessionRefreshTimer = setInterval(checkAndRefresh, 120000);

    return () => {
      console.log('🛑 Stopping user activity detection');
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      if (sessionRefreshTimer) {
        clearInterval(sessionRefreshTimer);
      }
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
