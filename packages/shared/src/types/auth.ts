export type UserRole = 'citizen' | 'sahayak' | 'admin';

export interface AuthUser {
  id: string;
  phone: string;
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
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
