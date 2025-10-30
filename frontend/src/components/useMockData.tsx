import { useState, useEffect } from 'react';

export type ExamType = 
  | 'Six-monthly Medical Exam for Migrant Domestic Worker (MOM)'
  | 'Full Medical Exam for Work Permit (MOM)'
  | 'Medical Exam for Aged Drivers (SPF)';

export type SubmissionStatus = 'draft' | 'pending_approval' | 'submitted' | 'rejected';

export interface MedicalSubmission {
  id: string;
  examType: ExamType;
  patientName: string;
  patientNric: string;
  patientDateOfBirth: string;
  status: SubmissionStatus;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  submittedDate?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  clinicId: string;
  formData: Record<string, any>;
}

const generateMockSubmissions = (): MedicalSubmission[] => [
  {
    id: 'sub-001',
  examType: 'Six-monthly Medical Exam for Migrant Domestic Worker (MOM)',
    patientName: 'Maria Santos',
    patientNric: 'S1234567A',
    patientDateOfBirth: '1990-05-15',
    status: 'submitted',
    createdBy: '2',
    createdByName: 'Nurse Mary Lim',
    createdDate: '2025-10-15T10:30:00',
    submittedDate: '2025-10-15T14:20:00',
    approvedBy: '1',
    approvedByName: 'Dr. Sarah Tan',
    approvedDate: '2025-10-15T14:00:00',
    clinicId: 'clinic1',
    formData: {
      height: '160',
      weight: '55',
      bloodPressure: '120/80',
      pregnancyTest: 'Negative',
      chestXray: 'Normal',
    },
  },
  {
    id: 'sub-002',
    examType: 'Full Medical Exam for Work Permit (MOM)',
    patientName: 'John Tan',
    patientNric: 'S2345678B',
    patientDateOfBirth: '1985-08-22',
    status: 'submitted',
    createdBy: '1',
    createdByName: 'Dr. Sarah Tan',
    createdDate: '2025-10-18T09:15:00',
    submittedDate: '2025-10-18T09:15:00',
    clinicId: 'clinic1',
    formData: {
      height: '175',
      weight: '70',
      bloodPressure: '118/75',
      hivTest: 'Negative',
      tbTest: 'Negative',
    },
  },
  {
    id: 'sub-003',
    examType: 'Medical Exam for Aged Drivers (SPF)',
    patientName: 'Lim Ah Kow',
    patientNric: 'S3456789C',
    patientDateOfBirth: '1955-03-10',
    status: 'pending_approval',
    createdBy: '2',
    createdByName: 'Nurse Mary Lim',
    createdDate: '2025-10-20T11:00:00',
    clinicId: 'clinic1',
    formData: {
      visualAcuity: '6/6',
      hearingTest: 'Normal',
      bloodPressure: '130/85',
      diabetes: 'No',
    },
  },
  {
    id: 'sub-004',
  examType: 'Six-monthly Medical Exam for Migrant Domestic Worker (MOM)',
    patientName: 'Fatima Abdul',
    patientNric: 'S4567890D',
    patientDateOfBirth: '1992-11-28',
    status: 'submitted',
    createdBy: '1',
    createdByName: 'Dr. Sarah Tan',
    createdDate: '2025-10-21T13:45:00',
    submittedDate: '2025-10-21T13:45:00',
    clinicId: 'clinic1',
    formData: {
      height: '158',
      weight: '52',
      bloodPressure: '115/75',
      pregnancyTest: 'Negative',
      chestXray: 'Normal',
    },
  },
];

const generateMockDrafts = (): MedicalSubmission[] => [
  {
    id: 'draft-001',
    examType: 'Full Medical Exam for Work Permit (MOM)',
    patientName: 'Wang Wei',
    patientNric: 'S5678901E',
    patientDateOfBirth: '1988-07-14',
    status: 'draft',
    createdBy: '2',
    createdByName: 'Nurse Mary Lim',
    createdDate: '2025-10-22T08:30:00',
    clinicId: 'clinic1',
    formData: {
      height: '170',
      weight: '68',
    },
  },
  {
    id: 'draft-002',
    examType: 'Medical Exam for Aged Drivers (SPF)',
    patientName: 'Tan Siew Eng',
    patientNric: 'S6789012F',
    patientDateOfBirth: '1958-12-05',
    status: 'draft',
    createdBy: '1',
    createdByName: 'Dr. Sarah Tan',
    createdDate: '2025-10-21T16:20:00',
    clinicId: 'clinic1',
    formData: {
      visualAcuity: '6/9',
    },
  },
];

export function useMockData() {
  const [submissions, setSubmissions] = useState<MedicalSubmission[]>([]);
  const [drafts, setDrafts] = useState<MedicalSubmission[]>([]);

  useEffect(() => {
    // Load from localStorage or use defaults
    const savedSubmissions = localStorage.getItem('medicalSubmissions');
    const savedDrafts = localStorage.getItem('medicalDrafts');
    
    setSubmissions(savedSubmissions ? JSON.parse(savedSubmissions) : generateMockSubmissions());
    setDrafts(savedDrafts ? JSON.parse(savedDrafts) : generateMockDrafts());
  }, []);

  const saveSubmission = (submission: MedicalSubmission) => {
    if (submission.status === 'draft') {
      const updatedDrafts = drafts.some(d => d.id === submission.id)
        ? drafts.map(d => d.id === submission.id ? submission : d)
        : [...drafts, submission];
      setDrafts(updatedDrafts);
      localStorage.setItem('medicalDrafts', JSON.stringify(updatedDrafts));
    } else {
      // Move from drafts to submissions if it was a draft
      const updatedDrafts = drafts.filter(d => d.id !== submission.id);
      setDrafts(updatedDrafts);
      localStorage.setItem('medicalDrafts', JSON.stringify(updatedDrafts));

      const updatedSubmissions = submissions.some(s => s.id === submission.id)
        ? submissions.map(s => s.id === submission.id ? submission : s)
        : [...submissions, submission];
      setSubmissions(updatedSubmissions);
      localStorage.setItem('medicalSubmissions', JSON.stringify(updatedSubmissions));
    }
  };

  const getSubmissionById = (id: string): MedicalSubmission | undefined => {
    return submissions.find(s => s.id === id) || drafts.find(d => d.id === id);
  };

  const deleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem('medicalDrafts', JSON.stringify(updatedDrafts));
  };

  return {
    submissions,
    drafts,
    saveSubmission,
    getSubmissionById,
    deleteDraft,
  };
}
