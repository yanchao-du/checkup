import { Content, StyleDictionary } from 'pdfmake/interfaces';

export interface SubmissionData {
  id: string;
  examType: string;
  patientName: string;
  patientNric?: string;
  patientPassportNo?: string;
  patientDateOfBirth?: string;
  patientEmail?: string;
  patientMobile?: string;
  examinationDate?: string;
  status: string;
  formData: Record<string, any>;
  drivingLicenseClass?: string;
  purposeOfExam?: string;
  createdByName?: string;
  createdByMcrNumber?: string;
  approvedByName?: string;
  approvedByMcrNumber?: string;
  clinicName?: string;
  clinicHciCode?: string;
  clinicPhone?: string;
  submittedDate?: string;
}

export interface DocumentSection {
  content: Content[];
}

export type ExamTypeGenerator = (submission: SubmissionData) => Content[];
