import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with auth token
const getAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export interface PatientInfo {
  nric: string;
  name: string;
  gender?: string;
  lastHeight?: string;
  lastWeight?: string;
  lastExamDate?: string;
  requiredTests?: {
    pregnancy: boolean;
    syphilis: boolean;
    hiv: boolean;
    chestXray: boolean;
  };
}

export interface RandomTestFin {
  fin: string;
  name: string;
}

/**
 * API to lookup patient information by NRIC/FIN from the database
 */
export const patientsApi = {
  /**
   * Get patient info by NRIC/FIN from the database
   * @param nric - The NRIC or FIN number
   * @returns Promise with patient info or null if not found
   */
  async getByNric(nric: string): Promise<PatientInfo | null> {
    try {
      const api = getAxiosInstance();
      const response = await api.post<PatientInfo>('/patients/lookup', { nric });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Error fetching patient by NRIC:', error);
      throw error;
    }
  },

  /**
   * Get a random test FIN from the seeded patient data
   * Used for displaying test FINs to users
   */
  async getRandomTestFin(examType?: string): Promise<RandomTestFin | null> {
    try {
      const api = getAxiosInstance();
      const params = examType ? { examType } : {};
      const response = await api.get<RandomTestFin>('/patients/random-test-fin', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching random test FIN:', error);
      return null;
    }
  },
};
