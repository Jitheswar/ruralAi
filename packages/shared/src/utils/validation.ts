export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return cleaned;
}

export function isValidOtp(otp: string, length: number = 6): boolean {
  return new RegExp(`^\\d{${length}}$`).test(otp);
}

export function isValidAbhaId(abhaId: string): boolean {
  return /^\d{2}-\d{4}-\d{4}-\d{4}$/.test(abhaId) || /^[a-zA-Z0-9.]+@abdm$/.test(abhaId);
}
