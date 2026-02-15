export function formatCurrency(amount: number): string {
  return `\u20B9${amount.toFixed(2)}`;
}

export function formatAge(age: number): string {
  if (age < 1) return 'Infant';
  if (age < 12) return `${age} yrs (Child)`;
  return `${age} yrs`;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
