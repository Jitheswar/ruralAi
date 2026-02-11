export type UserRole = 'citizen' | 'sahayak' | 'admin';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  abhaId?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthSession {
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  completeProfile: (password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
}
