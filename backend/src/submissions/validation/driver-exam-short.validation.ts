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
  const { formData } = dto;

  if (!formData) {
    throw new BadRequestException('Form data is required');
  }

  const patientInfo = formData.patientInfo || {};
  const assessment = formData.assessment || {};
  const declaration = formData.declaration || {};

  // Validate Patient NRIC
  if (!patientInfo.nric) {
    throw new BadRequestException('Patient NRIC is required');
  }
  if (!validateNric(patientInfo.nric)) {
    throw new BadRequestException('Invalid NRIC format');
  }

  // Validate Patient Name
  if (!patientInfo.name || typeof patientInfo.name !== 'string' || patientInfo.name.trim() === '') {
    throw new BadRequestException('Patient name is required');
  }

  // Validate Mobile Number
  if (!patientInfo.mobileNumber) {
    throw new BadRequestException('Mobile number is required');
  }
  if (!validateMobileNumber(patientInfo.mobileNumber)) {
    throw new BadRequestException(
      'Invalid mobile number format. Expected +65 followed by 8 digits',
    );
  }

  // Validate Examination Date
  if (!patientInfo.examinationDate) {
    throw new BadRequestException('Examination date is required');
  }

  // Validate Purpose of Exam
  if (!patientInfo.purposeOfExam) {
    throw new BadRequestException('Purpose of exam is required');
  }
  if (!VALID_PURPOSES.includes(patientInfo.purposeOfExam)) {
    throw new BadRequestException('Invalid purpose of exam');
  }

  // Validate Fitness Determinations based on Purpose
  const purpose = patientInfo.purposeOfExam;

  if (purpose === PURPOSE_AGE_65_ABOVE_TP_ONLY) {
    // Requires fitToDriveMotorVehicle
    if (assessment.fitToDriveMotorVehicle === undefined || assessment.fitToDriveMotorVehicle === null) {
      throw new BadRequestException('Fitness to drive motor vehicle determination is required');
    }
  } else if (purpose === PURPOSE_AGE_65_ABOVE_TP_LTA || purpose === PURPOSE_AGE_64_BELOW_LTA_ONLY) {
    // Requires both fitToDrivePublicService AND fitBusAttendant
    if (assessment.fitToDrivePublicService === undefined || assessment.fitToDrivePublicService === null) {
      throw new BadRequestException('Public service vehicle fitness determination is required');
    }
    if (assessment.fitBusAttendant === undefined || assessment.fitBusAttendant === null) {
      throw new BadRequestException('Bus attendant vocational licence fitness determination is required');
    }
  } else if (purpose === PURPOSE_BAVL_ANY_AGE) {
    // Requires fitBusAttendant only
    if (assessment.fitBusAttendant === undefined || assessment.fitBusAttendant === null) {
      throw new BadRequestException('Bus attendant vocational licence fitness determination is required');
    }
  }

  // Validate Declaration
  if (declaration.confirmed !== true) {
    throw new BadRequestException('Declaration confirmation is required');
  }
}
