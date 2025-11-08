export function validateSystolic(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  // Regex: ^[0-9]{2,3}$ - Must be 2-3 digits only (no decimals, letters, or special chars)
  // Range: 50-300 mmHg (systolic blood pressure range)
  if (!/^[0-9]{2,3}$/.test(value) || num < 50 || num > 300) {
    return 'Please enter a value between 50 and 300 mmHg.';
  }
  return null;
}

export function validateDiastolic(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  // Regex: ^[0-9]{2,3}$ - Must be 2-3 digits only (no decimals, letters, or special chars)
  // Range: 30-200 mmHg (diastolic blood pressure range)
  if (!/^[0-9]{2,3}$/.test(value) || num < 30 || num > 200) {
    return 'Please enter a value between 30 and 200 mmHg.';
  }
  return null;
}

export function validateBloodPressure(systolic: string, diastolic: string): string | null {
  // First validate individual values
  const systolicError = validateSystolic(systolic);
  const diastolicError = validateDiastolic(diastolic);
  
  if (systolicError) return systolicError;
  if (diastolicError) return diastolicError;
  
  // Check if both are provided
  if (!systolic || !diastolic) return null;
  
  // Validate that systolic is higher than diastolic
  const systolicNum = Number(systolic);
  const diastolicNum = Number(diastolic);
  
  if (systolicNum <= diastolicNum) {
    return 'Systolic pressure must be higher than diastolic pressure.';
  }
  
  return null;
}

export function validatePulse(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  // Regex: ^[0-9]{2,3}$ - Must be 2-3 digits only (no decimals, letters, or special chars)
  // Range: 30-250 bpm (realistic heart rate range)
  if (!/^[0-9]{2,3}$/.test(value) || num < 30 || num > 250) {
    return 'Please enter a valid heart rate between 30 and 250 bpm.';
  }
  return null;
}

export function validateWeight(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  // Regex: ^[0-9]{1,3}$ - Must be 1-3 digits only (no decimals)
  // Range: 1-500 kg (realistic weight range for adults)
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
  // Regex: ^[0-9]{2,3}$ - Must be 2-3 digits only (no decimals)
  // Range: 10-300 cm (realistic height range for adults and children)
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

/**
 * Validates patient name input
 * 
 * Validation Rules:
 * - Minimum length: 2 characters (after trimming whitespace)
 * - Maximum length: 120 characters (after trimming whitespace)
 * - Allowed characters:
 *   * Letters: A-Z, a-z (both uppercase and lowercase)
 *   * Spaces (but not leading/trailing - they are trimmed)
 *   * Hyphens: -
 *   * Apostrophes: '
 *   * Periods: .
 *   * Parentheses: ( )
 * 
 * Regex Pattern: ^[A-Za-z\s'\.\-\(\)]{2,120}$
 * Breakdown:
 *   ^                    - Start of string
 *   [A-Za-z\s'\.\-\(\)]  - Character class allowing:
 *                          A-Z (uppercase letters)
 *                          a-z (lowercase letters)
 *                          \s (whitespace/spaces)
 *                          ' (apostrophe)
 *                          \. (period/dot - escaped)
 *                          \- (hyphen - escaped)
 *                          \( (left parenthesis - escaped)
 *                          \) (right parenthesis - escaped)
 *   {2,120}              - Length must be between 2 and 120 characters
 *   $                    - End of string
 * 
 * Examples of valid names:
 * - "John Smith"
 * - "Mary O'Brien"
 * - "Jean-Paul Dubois"
 * - "Dr. Jane Doe"
 * - "Anne-Marie D'Angelo"
 * - "John Smith (Alias)"
 * - "李明 (Lee Ming)"
 * 
 * @param value - The patient name to validate
 * @returns Error message string if invalid, null if valid
 */
export function validatePatientName(value: string): string | null {
  if (!value) {
    return 'Patient name is required';
  }
  
  // Trim whitespace from the value
  const trimmedValue = value.trim();
  
  // Check minimum length
  if (trimmedValue.length < 2) {
    return 'Patient name must be at least 2 characters';
  }
  
  // Check maximum length
  if (trimmedValue.length > 120) {
    return 'Patient name must not exceed 120 characters';
  }
  
  // Regex: ^[A-Za-z\s'\.\-\(\)]+$
  // Allows letters, spaces, hyphens, apostrophes, periods, and parentheses
  const nameRegex = /^[A-Za-z\s'\.\-\(\)]+$/;
  
  if (!nameRegex.test(trimmedValue)) {
    return 'Patient name can only contain letters, spaces, hyphens, apostrophes, periods, and parentheses';
  }
  
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value) return null; // Optional field
  // Regex: ^[^\s@]+@[^\s@]+\.[^\s@]+$
  // Breakdown:
  //   ^          - Start of string
  //   [^\s@]+    - One or more characters that are NOT whitespace or @
  //   @          - Literal @ symbol
  //   [^\s@]+    - One or more characters that are NOT whitespace or @
  //   \.         - Literal dot (.)
  //   [^\s@]+    - One or more characters that are NOT whitespace or @
  //   $          - End of string
  // Examples: user@example.com, name@domain.co.uk
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validateSingaporeMobile(value: string): string | null {
  if (!value) return null; // Optional field
  // Remove spaces and +65 prefix if present for validation
  // Regex for cleaning: /\s+/g - Matches one or more whitespace characters
  // Regex for prefix: /^\+65/ - Matches +65 at start of string
  const cleaned = value.replace(/\s+/g, '').replace(/^\+65/, '');
  
  // Regex: ^[89]\d{7}$
  // Breakdown:
  //   ^      - Start of string
  //   [89]   - First digit must be 8 or 9 (Singapore mobile number prefix)
  //   \d{7}  - Exactly 7 more digits (total 8 digits)
  //   $      - End of string
  // Valid formats after cleaning: 81234567, 91234567
  // Accepts input like: "91234567", "9123 4567", "+6591234567"
  if (!/^[89]\d{7}$/.test(cleaned)) {
    return 'Mobile number must be 8 digits starting with 8 or 9';
  }
  return null;
}

export function validatePassportNo(value: string): string | null {
  if (!value) return null; // Optional field in general, but required for ICA exams
  // Regex: ^[A-Za-z0-9]{1,15}$
  // Breakdown:
  //   ^           - Start of string
  //   [A-Za-z0-9] - Only alphanumeric characters (letters and numbers)
  //   {1,15}      - Must be between 1 and 15 characters
  //   $           - End of string
  // Examples: ABC123456, P1234567, 123456789
  if (!/^[A-Za-z0-9]{1,15}$/.test(value)) {
    return 'Passport number must be alphanumeric and max 15 characters';
  }
  return null;
}
