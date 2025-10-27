// validationRules.ts
// Centralized validation functions for NewSubmission form

export function validateHeight(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  if (!/^[0-9]{2,3}$/.test(value) || num < 10 || num > 300) {
    return 'Height must be a number between 10 and 300 (2-3 digits).';
  }
  return null;
}

export function validateNricOrFin(value: string, validateNRIC: (nric: string) => boolean): string | null {
  if (value && !validateNRIC(value)) {
    return 'Invalid NRIC/FIN format';
  }
  return null;
}
