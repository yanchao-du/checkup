import { BadRequestException } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/submission.dto';

/**
 * Check if exam type is a short form driver medical exam
 */
export function isShortDriverExam(examType: string): boolean {
  return (
    examType === 'DRIVING_LICENCE_TP_SHORT' ||
    examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT' ||
    examType === 'VOCATIONAL_LICENCE_LTA_SHORT'
  );
}

/**
 * Purpose of exam constants
 */
export const PURPOSE_AGE_65_ABOVE_TP_ONLY = 'AGE_65_ABOVE_TP_ONLY';
export const PURPOSE_AGE_65_ABOVE_TP_LTA = 'AGE_65_ABOVE_TP_LTA';
export const PURPOSE_AGE_64_BELOW_LTA_ONLY = 'AGE_64_BELOW_LTA_ONLY';
export const PURPOSE_BAVL_ANY_AGE = 'BAVL_ANY_AGE';

const VALID_PURPOSES = [
  PURPOSE_AGE_65_ABOVE_TP_ONLY,
  PURPOSE_AGE_65_ABOVE_TP_LTA,
  PURPOSE_AGE_64_BELOW_LTA_ONLY,
  PURPOSE_BAVL_ANY_AGE,
];

/**
 * Validate Singapore mobile number format: +65 followed by 8 digits
 */
function validateMobileNumber(mobileNumber: string): boolean {
  const mobileRegex = /^\+65\d{8}$/;
  return mobileRegex.test(mobileNumber);
}

/**
 * Validate NRIC/FIN format (basic validation)
 */
function validateNric(nric: string): boolean {
  if (!nric || typeof nric !== 'string') return false;
  // Basic format: Letter + 7 digits + Letter (e.g., S1234567D)
  const nricRegex = /^[STFGM]\d{7}[A-Z]$/i;
  return nricRegex.test(nric);
}

/**
 * Main validation function for short form driver exams
 */
export function validateShortDriverExam(dto: CreateSubmissionDto): void {
  const { formData, patientNric, patientName, patientMobile, examinationDate, purposeOfExam } = dto;

  if (!formData) {
    throw new BadRequestException('Form data is required');
  }

  // For short driver exams, fitness fields are stored at the root level of formData
  // not in a nested assessment object

  // Validate Patient NRIC (comes from dto.patientNric at root level)
  if (!patientNric) {
    throw new BadRequestException('Patient NRIC is required');
  }
  if (!validateNric(patientNric)) {
    throw new BadRequestException('Invalid NRIC format');
  }

  // Validate Patient Name (comes from dto.patientName at root level)
  if (!patientName || typeof patientName !== 'string' || patientName.trim() === '') {
    throw new BadRequestException('Patient name is required');
  }

  // Validate Mobile Number (comes from dto.patientMobile at root level)
  if (!patientMobile) {
    throw new BadRequestException('Mobile number is required');
  }
  if (!validateMobileNumber(patientMobile)) {
    throw new BadRequestException(
      'Invalid mobile number format. Expected +65 followed by 8 digits',
    );
  }

  // Validate Examination Date (comes from dto.examinationDate at root level)
  if (!examinationDate) {
    throw new BadRequestException('Examination date is required');
  }

  // Validate Purpose of Exam (comes from dto.purposeOfExam at root level)
  if (!purposeOfExam) {
    throw new BadRequestException('Purpose of exam is required');
  }
  if (!VALID_PURPOSES.includes(purposeOfExam)) {
    throw new BadRequestException('Invalid purpose of exam');
  }

  // Validate Fitness Determinations based on Purpose
  // purposeOfExam already extracted from dto at function level
  if (purposeOfExam === PURPOSE_AGE_65_ABOVE_TP_ONLY) {
    // Requires fitToDriveMotorVehicle
    if (formData.fitToDriveMotorVehicle === undefined || formData.fitToDriveMotorVehicle === null) {
      throw new BadRequestException('Fitness to drive motor vehicle determination is required');
    }
  } else if (purposeOfExam === PURPOSE_AGE_65_ABOVE_TP_LTA || purposeOfExam === PURPOSE_AGE_64_BELOW_LTA_ONLY) {
    // Requires both fitToDrivePsv AND fitForBavl
    if (formData.fitToDrivePsv === undefined || formData.fitToDrivePsv === null) {
      throw new BadRequestException('Public service vehicle fitness determination is required');
    }
    if (formData.fitForBavl === undefined || formData.fitForBavl === null) {
      throw new BadRequestException('Bus attendant vocational licence fitness determination is required');
    }
  } else if (purposeOfExam === PURPOSE_BAVL_ANY_AGE) {
    // Requires fitForBavl only
    if (formData.fitForBavl === undefined || formData.fitForBavl === null) {
      throw new BadRequestException('Bus attendant vocational licence fitness determination is required');
    }
  }

  // Validate Declaration
  // Declaration checkbox is stored at root of formData as 'declarationAgreed'
  if (formData.declarationAgreed !== true) {
    throw new BadRequestException('Declaration confirmation is required');
  }
}
