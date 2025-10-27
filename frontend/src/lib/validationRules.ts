export function validateSystolic(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  if (!/^[0-9]{2,3}$/.test(value) || num < 50 || num > 250) {
    return 'Systolic (high) must be 2-3 digits, between 50 and 250.';
  }
  return null;
}

export function validateDiastolic(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  if (!/^[0-9]{2,3}$/.test(value) || num < 30 || num > 150) {
    return 'Diastolic (low) must be 2-3 digits, between 30 and 150.';
  }
  return null;
}
export function validateWeight(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  if (!/^[0-9]{1,3}$/.test(value) || num < 1 || num > 500) {
    return 'Weight must be a number between 1 and 500 (1-3 digits).';
  }
  return null;
}
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
