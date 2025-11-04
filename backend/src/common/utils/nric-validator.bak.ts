/**
 * Singapore NRIC/FIN Validation Utility
 * 
 * NRIC format: X1234567Y where:
 * - X = S (Singapore Citizen born before 2000), T (born 2000+), F (Foreigner), G (Foreigner born 2000+), M (Malaysia PR)
 * - 1234567 = 7 digits
 * - Y = checksum letter
 * 
 * Algorithm:
 * 1. Multiply each digit by weight: [2, 7, 6, 5, 4, 3, 2]
 * 2. Sum the products
 * 3. For S/T: Add 0, For F/G: Add 4, For M: Add 3
 * 4. Modulo 11
 * 5. Map to checksum letter using lookup table
 */


// Use shared NRIC validator implementation
/**
 * Singapore NRIC/FIN Validation Utility (shared)
 *
 * NRIC format: X1234567Y where:
 * - X = S (Singapore Citizen born before 2000), T (born 2000+), F (Foreigner), G (Foreigner born 2000+), M (Malaysia PR)
 * - 1234567 = 7 digits
 * - Y = checksum letter
 *
 * Algorithm:
 * 1. Multiply each digit by weight: [2, 7, 6, 5, 4, 3, 2]
 * 2. Sum the products
 * 3. For S/T: Add 0, For F/G: Add 4, For M: Add 3
 * 4. Modulo 11
 * 5. Map to checksum letter using lookup table
 */

const ST_CHECKSUMS = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
const FG_CHECKSUMS = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
const M_CHECKSUMS = ['K', 'L', 'J', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X'];

const WEIGHTS = [2, 7, 6, 5, 4, 3, 2];

/**
 * Validate Singapore NRIC/FIN using official checksum algorithm
 * @param nric - NRIC/FIN string (e.g., S1234567D, T0123456G, F1234567X)
 * @returns true if valid, false otherwise
 */
export function validateNRIC(nric: string): boolean {
  if (!nric || typeof nric !== 'string') {
    return false;
  }

  // Remove whitespace and convert to uppercase
  const cleanNRIC = nric.trim().toUpperCase();

  // Check format: 1 letter + 7 digits + 1 letter
  const nricPattern = /^[STFGM]\d{7}[A-Z]$/;
  if (!nricPattern.test(cleanNRIC)) {
    return false;
  }

  const prefix = cleanNRIC[0];
  const digits = cleanNRIC.substring(1, 8);
  const checksum = cleanNRIC[8];

  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits[i]) * WEIGHTS[i];
  }

  // Add offset based on prefix
  if (prefix === 'T' || prefix === 'G') {
    sum += 4;
  } else if (prefix === 'M') {
    sum += 3;
  }
  // S and F have offset 0

  // Get remainder
  const remainder = sum % 11;

  // Get expected checksum
  let expectedChecksum: string;
  if (prefix === 'S' || prefix === 'T') {
    expectedChecksum = ST_CHECKSUMS[remainder];
  } else if (prefix === 'F' || prefix === 'G') {
    expectedChecksum = FG_CHECKSUMS[remainder];
  } else if (prefix === 'M') {
    expectedChecksum = M_CHECKSUMS[remainder];
  } else {
    return false;
  }

  return checksum === expectedChecksum;
}

/**
 * Generate valid NRICs for testing purposes
 * @param prefix - NRIC prefix (S, T, F, G, M)
 * @param digits - 7-digit number as string
 * @returns Valid NRIC with correct checksum
 */
export function generateValidNRIC(prefix: 'S' | 'T' | 'F' | 'G' | 'M', digits: string): string {
  if (digits.length !== 7 || !/^\d{7}$/.test(digits)) {
    throw new Error('Digits must be exactly 7 numeric characters');
  }

  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits[i]) * WEIGHTS[i];
  }

  // Add offset based on prefix
  if (prefix === 'T' || prefix === 'G') {
    sum += 4;
  } else if (prefix === 'M') {
    sum += 3;
  }

  // Get remainder
  const remainder = sum % 11;

  // Get checksum
  let checksum: string;
  if (prefix === 'S' || prefix === 'T') {
    checksum = ST_CHECKSUMS[remainder];
  } else if (prefix === 'F' || prefix === 'G') {
    checksum = FG_CHECKSUMS[remainder];
  } else if (prefix === 'M') {
    checksum = M_CHECKSUMS[remainder];
  } else {
    throw new Error('Invalid prefix. Must be S, T, F, G, or M');
  }

  return `${prefix}${digits}${checksum}`;
}
