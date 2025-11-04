/**
 * NRIC/FIN validation and generation utility
 * Based on Singapore NRIC/FIN checksum algorithm
 */

const NRIC_WEIGHTS = [2, 7, 6, 5, 4, 3, 2];
const ST_FG_CHECKSUM = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
const M_CHECKSUM = ['K', 'L', 'J', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X'];

/**
 * Validates an NRIC/FIN number
 */
export function isValidNRIC(nric: string): boolean {
  if (!nric || nric.length !== 9) return false;

  const prefix = nric.charAt(0).toUpperCase();
  const suffix = nric.charAt(8).toUpperCase();
  const digits = nric.substring(1, 8);

  // Check if digits are valid
  if (!/^\d{7}$/.test(digits)) return false;

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits.charAt(i)) * NRIC_WEIGHTS[i];
  }

  // Add offset for M prefix
  if (prefix === 'M') {
    sum += 4;
  }

  const remainder = sum % 11;
  const checksumArray = prefix === 'M' ? M_CHECKSUM : ST_FG_CHECKSUM;
  const expectedChecksum = checksumArray[remainder];

  return suffix === expectedChecksum;
}

/**
 * Generates a valid NRIC/FIN number
 */
export function generateValidNRIC(prefix: 'S' | 'T' | 'F' | 'G' | 'M' = 'S', digits?: string): string {
  // Use provided digits or generate random 7 digits
  const nricDigits = digits || Math.floor(1000000 + Math.random() * 9000000).toString();

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(nricDigits.charAt(i)) * NRIC_WEIGHTS[i];
  }

  // Add offset for M prefix
  if (prefix === 'M') {
    sum += 4;
  }

  const remainder = sum % 11;
  const checksumArray = prefix === 'M' ? M_CHECKSUM : ST_FG_CHECKSUM;
  const checksum = checksumArray[remainder];

  return `${prefix}${nricDigits}${checksum}`;
}

/**
 * Generates a checksum for given NRIC prefix and digits
 */
export function calculateNRICChecksum(prefix: string, digits: string): string {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits.charAt(i)) * NRIC_WEIGHTS[i];
  }

  if (prefix === 'M') {
    sum += 4;
  }

  const remainder = sum % 11;
  const checksumArray = prefix === 'M' ? M_CHECKSUM : ST_FG_CHECKSUM;
  return checksumArray[remainder];
}