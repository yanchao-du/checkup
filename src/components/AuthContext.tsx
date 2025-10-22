import { createContext, useContext, useState, ReactNode } from 'react';

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
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: Record<string, User & { password: string }> = {
  'doctor@clinic.sg': {
    id: '1',
    email: 'doctor@clinic.sg',
    password: 'password',
    name: 'Dr. Sarah Tan',
    role: 'doctor',
    clinicId: 'clinic1',
    clinicName: 'HealthFirst Medical Clinic',
  },
  'nurse@clinic.sg': {
    id: '2',
    email: 'nurse@clinic.sg',
    password: 'password',
    name: 'Nurse Mary Lim',
    role: 'nurse',
    clinicId: 'clinic1',
    clinicName: 'HealthFirst Medical Clinic',
  },
  'admin@clinic.sg': {
    id: '3',
    email: 'admin@clinic.sg',
    password: 'password',
    name: 'Admin John Wong',
    role: 'admin',
    clinicId: 'clinic1',
    clinicName: 'HealthFirst Medical Clinic',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const foundUser = mockUsers[email];
    if (foundUser && foundUser.password === password) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
