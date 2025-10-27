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
import { validateNRIC, generateValidNRIC } from '../../../../shared/nric_validator';

export { validateNRIC, generateValidNRIC };
