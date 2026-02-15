export const ROLES = {
  CITIZEN: 'citizen',
  SAHAYAK: 'sahayak',
  ADMIN: 'admin',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  citizen: 'Citizen (Beneficiary)',
  sahayak: 'Sahayak (ASHA Worker)',
  admin: 'Admin / Doctor',
};
