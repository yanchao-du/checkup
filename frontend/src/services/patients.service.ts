import { generateValidNRIC } from '../lib/nric_validator';

// Mock patient data for testing - all NRICs are valid according to Singapore checksum algorithm
interface MockPatientData {
  name: string;
  lastHeight?: string;
  lastWeight?: string;
  lastExamDate?: string;
}

const MOCK_PATIENTS: Record<string, MockPatientData> = {
  // Singapore Citizens (S prefix)
  [generateValidNRIC('S', '1234567')]: { 
    name: 'John Smith',
    lastHeight: '175',
    lastWeight: '72',
    lastExamDate: '2025-04-15'
  },
  [generateValidNRIC('S', '2345678')]: { 
    name: 'Mary Johnson',
    lastHeight: '162',
    lastWeight: '58',
    lastExamDate: '2025-05-20'
  },
  [generateValidNRIC('S', '3456789')]: { 
    name: 'David Chen',
    lastHeight: '178',
    lastWeight: '80',
    lastExamDate: '2025-03-10'
  },
  [generateValidNRIC('S', '4567890')]: { 
    name: 'Sarah Tan',
    lastHeight: '165',
    lastWeight: '55',
    lastExamDate: '2025-06-05'
  },
  [generateValidNRIC('S', '5678901')]: { 
    name: 'Michael Lee',
    lastHeight: '182',
    lastWeight: '85',
    lastExamDate: '2025-02-28'
  },
  [generateValidNRIC('S', '6789012')]: { 
    name: 'Jennifer Wong',
    lastHeight: '160',
    lastWeight: '52',
    lastExamDate: '2025-07-12'
  },
  [generateValidNRIC('S', '7890123')]: { 
    name: 'Robert Kumar',
    lastHeight: '170',
    lastWeight: '68',
    lastExamDate: '2025-04-22'
  },
  [generateValidNRIC('S', '8901234')]: { 
    name: 'Patricia Lim',
    lastHeight: '158',
    lastWeight: '50',
    lastExamDate: '2025-05-30'
  },
  [generateValidNRIC('S', '9012345')]: { 
    name: 'James Ng',
    lastHeight: '176',
    lastWeight: '75',
    lastExamDate: '2025-03-18'
  },
  [generateValidNRIC('S', '0123456')]: { 
    name: 'Linda Ong',
    lastHeight: '163',
    lastWeight: '56',
    lastExamDate: '2025-06-25'
  },
  
  // Foreign Workers (G prefix - issued 2000+)
  [generateValidNRIC('G', '1234567')]: { 
    name: 'Maria Santos',
    lastHeight: '155',
    lastWeight: '48',
    lastExamDate: '2025-04-01'
  },
  [generateValidNRIC('G', '2345678')]: { 
    name: 'Ahmed Hassan',
    lastHeight: '172',
    lastWeight: '70',
    lastExamDate: '2025-05-15'
  },
  [generateValidNRIC('G', '3456789')]: { 
    name: 'Fatima Rahman',
    lastHeight: '160',
    lastWeight: '53',
    lastExamDate: '2025-03-20'
  },
  [generateValidNRIC('G', '4567890')]: { 
    name: 'Rajesh Kumar',
    lastHeight: '168',
    lastWeight: '65',
    lastExamDate: '2025-06-10'
  },
  [generateValidNRIC('G', '5678901')]: { 
    name: 'Sunita Devi',
    lastHeight: '157',
    lastWeight: '51',
    lastExamDate: '2025-02-14'
  },
  
  // Foreign Workers (F prefix - issued before 2000)
  [generateValidNRIC('F', '6789012')]: { 
    name: 'Mohammad Ali',
    lastHeight: '174',
    lastWeight: '73',
    lastExamDate: '2025-07-01'
  },
  [generateValidNRIC('F', '7890123')]: { 
    name: 'Priya Sharma',
    lastHeight: '161',
    lastWeight: '54',
    lastExamDate: '2025-04-18'
  },
  [generateValidNRIC('F', '8901234')]: { 
    name: 'Kumar Patel',
    lastHeight: '169',
    lastWeight: '67',
    lastExamDate: '2025-05-25'
  },
  [generateValidNRIC('F', '9012345')]: { 
    name: 'Lakshmi Nair',
    lastHeight: '159',
    lastWeight: '52',
    lastExamDate: '2025-03-08'
  },
  [generateValidNRIC('F', '0123456')]: { 
    name: 'Siti Aminah',
    lastHeight: '156',
    lastWeight: '49',
    lastExamDate: '2025-06-15'
  },
};

export interface PatientInfo {
  nric: string;
  name: string;
  lastHeight?: string;
  lastWeight?: string;
  lastExamDate?: string;
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
    const patientData = MOCK_PATIENTS[cleanNric];
    
    if (patientData) {
      return {
        nric: cleanNric,
        name: patientData.name,
        lastHeight: patientData.lastHeight,
        lastWeight: patientData.lastWeight,
        lastExamDate: patientData.lastExamDate,
      };
    }
    
    return null;
  },
  
  /**
   * Get all mock patients (for testing purposes)
   */
  async getAllMockPatients(): Promise<PatientInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return Object.entries(MOCK_PATIENTS).map(([nric, patientData]) => ({
      nric,
      name: patientData.name,
      lastHeight: patientData.lastHeight,
      lastWeight: patientData.lastWeight,
      lastExamDate: patientData.lastExamDate,
    }));
  },
};
