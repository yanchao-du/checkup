/**
 * Masks a patient name for verification purposes
 * Shows partial characters to allow human verification while protecting privacy
 * 
 * @param fullName - The full name to mask
 * @returns The masked name with visible characters followed by asterisks
 * 
 * @example
 * maskName('Mariange Thok') // Returns 'Maria*** Th**'
 * maskName('Nur Aisyah Binte Rahman') // Returns 'Nur Ai*** Bi*** Rah***'
 * maskName('Li') // Returns 'L*'
 */
export function maskName(fullName: string): string {
  if (!fullName) return '';
  
  return fullName
    .split(/\s+/)
    .map(part => {
      const clean = part.trim();
      if (!clean) return '';
      
      // For single character names, don't mask (too short for privacy concerns)
      if (clean.length === 1) {
        return clean;
      }
      
      // For 2-character names, show first char + asterisk
      if (clean.length === 2) {
        return clean[0] + '*';
      }
      
      // For longer names, show about half (minimum 2, maximum 4 chars visible)
      // Using Math.min to cap at 4, and Math.ceil to round up for better readability
      const visible = Math.min(4, Math.ceil(clean.length / 2));
      const masked = '*'.repeat(clean.length - visible);
      
      return clean.slice(0, visible) + masked;
    })
    .filter(part => part !== '') // Remove empty parts
    .join(' ');
}
