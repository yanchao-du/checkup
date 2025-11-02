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

export function validateEmail(value: string): string | null {
  if (!value) return null; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validateSingaporeMobile(value: string): string | null {
  if (!value) return null; // Optional field
  // Remove spaces and +65 prefix if present
  const cleaned = value.replace(/\s+/g, '').replace(/^\+65/, '');
  // Must be exactly 8 digits starting with 8 or 9
  if (!/^[89]\d{7}$/.test(cleaned)) {
    return 'Mobile number must be 8 digits starting with 8 or 9';
  }
  return null;
}
