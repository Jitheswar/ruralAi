// Types
export type { AuthUser, AuthSession, AuthContextType, UserRole } from './types/auth';
export type { Patient } from './types/patient';
export type { HealthLog, LogType, VitalsData, SymptomData } from './types/healthLog';
export type { Medicine } from './types/medicine';

// Constants
export { ROLES, ROLE_LABELS } from './constants/roles';
export { API_CONFIG, SESSION_KEY, OTP_LENGTH, OTP_EXPIRY_SECONDS, MAX_OTP_ATTEMPTS, MAX_ACTIVE_DEVICES, SAHAYAK_SESSION_TIMEOUT_MS, AUTO_LOCK_TIMEOUT_MS } from './constants/config';

// Supabase
export { SUPABASE_URL, SUPABASE_ANON_KEY } from './lib/supabase';

// Utils
export { isValidIndianPhone, formatPhone, isValidOtp, isValidAbhaId } from './utils/validation';
export { formatCurrency, formatAge, capitalizeFirst, truncate } from './utils/formatting';

// i18n
export * from './i18n';
