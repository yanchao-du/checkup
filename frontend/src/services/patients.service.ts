import { generateValidNRIC } from '../lib/nric_validator';

// Mock patient data for testing - all NRICs are valid according to Singapore checksum algorithm
const MOCK_PATIENTS: Record<string, string> = {
  // Singapore Citizens (S prefix)
  [generateValidNRIC('S', '1234567')]: 'John Smith',
  [generateValidNRIC('S', '2345678')]: 'Mary Johnson',
  [generateValidNRIC('S', '3456789')]: 'David Chen',
  [generateValidNRIC('S', '4567890')]: 'Sarah Tan',
  [generateValidNRIC('S', '5678901')]: 'Michael Lee',
  [generateValidNRIC('S', '6789012')]: 'Jennifer Wong',
  [generateValidNRIC('S', '7890123')]: 'Robert Kumar',
  [generateValidNRIC('S', '8901234')]: 'Patricia Lim',
  [generateValidNRIC('S', '9012345')]: 'James Ng',
  [generateValidNRIC('S', '0123456')]: 'Linda Ong',
  
  // Foreign Workers (G prefix - issued 2000+)
  [generateValidNRIC('G', '1234567')]: 'Maria Santos',
  [generateValidNRIC('G', '2345678')]: 'Ahmed Hassan',
  [generateValidNRIC('G', '3456789')]: 'Fatima Rahman',
  [generateValidNRIC('G', '4567890')]: 'Rajesh Kumar',
  [generateValidNRIC('G', '5678901')]: 'Sunita Devi',
  
  // Foreign Workers (F prefix - issued before 2000)
  [generateValidNRIC('F', '6789012')]: 'Mohammad Ali',
  [generateValidNRIC('F', '7890123')]: 'Priya Sharma',
  [generateValidNRIC('F', '8901234')]: 'Kumar Patel',
  [generateValidNRIC('F', '9012345')]: 'Lakshmi Nair',
  [generateValidNRIC('F', '0123456')]: 'Siti Aminah',
};

export interface PatientInfo {
  nric: string;
  name: string;
}

/**
 * Mock API to lookup patient information by NRIC/FIN
 * Simulates a delay to mimic real API behavior
 */
export const patientsApi = {
  /**
   * Get patient name by NRIC/FIN
   * @param nric - The NRIC or FIN number
   * @returns Promise with patient info or null if not found
   */
  async getByNric(nric: string): Promise<PatientInfo | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cleanNric = nric.trim().toUpperCase();
    const name = MOCK_PATIENTS[cleanNric];
    
    if (name) {
      return {
        nric: cleanNric,
        name,
      };
    }
    
    return null;
  },
  
  /**
   * Get all mock patients (for testing purposes)
   */
  async getAllMockPatients(): Promise<PatientInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return Object.entries(MOCK_PATIENTS).map(([nric, name]) => ({
      nric,
      name,
    }));
  },
};
