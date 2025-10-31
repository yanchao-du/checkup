import { BadRequestException } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/submission.dto';

/**
 * Check if exam type is a driver medical exam
 */
export function isDriverExam(examType: string): boolean {
  return (
    examType === 'DRIVING_LICENCE_TP' ||
    examType === 'DRIVING_VOCATIONAL_TP_LTA' ||
    examType === 'VOCATIONAL_LICENCE_LTA'
  );
}

/**
 * Check if exam type requires TP-specific validations
 */
export function requiresTpValidation(examType: string): boolean {
  return (
    examType === 'DRIVING_LICENCE_TP' ||
    examType === 'DRIVING_VOCATIONAL_TP_LTA'
  );
}

/**
 * Check if exam type requires LTA-specific validations
 */
export function requiresLtaValidation(examType: string): boolean {
  return (
    examType === 'DRIVING_VOCATIONAL_TP_LTA' ||
    examType === 'VOCATIONAL_LICENCE_LTA'
  );
}

/**
 * Validate that examination is within 2 months before patient's birthday
 * Per Road Traffic (Motor Vehicles, Driving Licence) Rules
 */
export function validateExamTiming(
  patientDateOfBirth: string,
  examinationDate: string,
): void {
  if (!patientDateOfBirth || !examinationDate) {
    throw new BadRequestException(
      'Patient date of birth and examination date are required for driver medical exams',
    );
  }

  const dob = new Date(patientDateOfBirth);
  const examDate = new Date(examinationDate);
  const today = new Date();

  // Exam date cannot be in the future
  if (examDate > today) {
    throw new BadRequestException('Examination date cannot be in the future');
  }

  // Calculate the next birthday after the exam date
  const examYear = examDate.getFullYear();
  let nextBirthday = new Date(dob);
  nextBirthday.setFullYear(examYear);

  // If the birthday already passed this year relative to exam, use next year
  if (nextBirthday < examDate) {
    nextBirthday.setFullYear(examYear + 1);
  }

  // Calculate 2 months before birthday
  const twoMonthsBeforeBirthday = new Date(nextBirthday);
  twoMonthsBeforeBirthday.setMonth(twoMonthsBeforeBirthday.getMonth() - 2);

  // Exam must be within 2 months before birthday
  if (examDate < twoMonthsBeforeBirthday || examDate > nextBirthday) {
    throw new BadRequestException(
      'Examination must be conducted within 2 months before the examinee\'s birthday per Road Traffic Rules',
    );
  }
}

/**
 * Validate AMT (Abbreviated Mental Test) data structure
 */
export function validateAmt(amt: any): void {
  if (!amt || typeof amt !== 'object') {
    throw new BadRequestException(
      'Abbreviated Mental Test is required for TP driving licence examinations',
    );
  }

  if (typeof amt.score !== 'number') {
    throw new BadRequestException('AMT score must be a number');
  }

  if (amt.score < 0 || amt.score > 10) {
    throw new BadRequestException('AMT score must be between 0 and 10');
  }
}

/**
 * Validate LTA Vocational Licence medical details
 */
export function validateLtaVocational(ltaVocational: any): void {
  if (!ltaVocational || typeof ltaVocational !== 'object') {
    throw new BadRequestException(
      'LTA Vocational Licence Medical Details are required',
    );
  }

  const requiredVisionFields = ['colorVision', 'peripheralVision', 'nightVision'];
  for (const field of requiredVisionFields) {
    if (!ltaVocational[field]) {
      throw new BadRequestException(
        `${field} is required for LTA vocational licence examinations`,
      );
    }
  }

  if (ltaVocational.fitForVocational === undefined || ltaVocational.fitForVocational === null) {
    throw new BadRequestException(
      'Fit for vocational duty determination is required',
    );
  }
}

/**
 * Validate medical declaration structure
 */
export function validateMedicalDeclaration(medicalDeclaration: any): void {
  if (!medicalDeclaration || typeof medicalDeclaration !== 'object') {
    throw new BadRequestException('Medical Declaration by Examinee is required');
  }
}

/**
 * Validate medical history structure
 */
export function validateMedicalHistory(medicalHistory: any): void {
  if (!medicalHistory || typeof medicalHistory !== 'object') {
    throw new BadRequestException('Medical History of Examinee is required');
  }
}

/**
 * Validate assessment section
 */
export function validateAssessment(assessment: any, examType: string): void {
  if (!assessment || typeof assessment !== 'object') {
    throw new BadRequestException('Medical practitioner assessment is required');
  }

  // Validate TP exams require fitToDrive
  if (requiresTpValidation(examType)) {
    if (assessment.fitToDrive === undefined || assessment.fitToDrive === null) {
      throw new BadRequestException('Fitness to drive determination is required');
    }
  }

  // Validate LTA exams require fitForVocational
  if (requiresLtaValidation(examType)) {
    if (assessment.fitForVocational === undefined || assessment.fitForVocational === null) {
      throw new BadRequestException(
        'Fitness for vocational duty determination is required',
      );
    }
  }

  // Remarks are required for all driver exams
  if (!assessment.remarks || assessment.remarks.trim() === '') {
    throw new BadRequestException('Medical practitioner remarks are required');
  }
}

/**
 * Validate common medical fields
 */
export function validateCommonFields(formData: any): void {
  const requiredFields = ['height', 'weight', 'bloodPressure', 'pulse', 'visualAcuity', 'hearingTest'];
  
  for (const field of requiredFields) {
    if (!formData[field]) {
      throw new BadRequestException(`${field} is required for driver medical examinations`);
    }
  }

  // Validate blood pressure format (systolic/diastolic)
  if (formData.bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(formData.bloodPressure)) {
    throw new BadRequestException(
      'Blood pressure must be in format systolic/diastolic (e.g., 120/80)',
    );
  }
}

/**
 * Main validation function for driver exam submissions
 */
export function validateDriverExam(dto: CreateSubmissionDto): void {
  const { examType, patientDateOfBirth, examinationDate, formData } = dto;

  // Only validate if it's a driver exam
  if (!isDriverExam(examType)) {
    return;
  }

  // Validate exam timing (within 2 months before birthday)
  if (patientDateOfBirth && examinationDate) {
    validateExamTiming(patientDateOfBirth, examinationDate);
  } else {
    throw new BadRequestException(
      'Patient date of birth and examination date are required for driver medical exams',
    );
  }

  // Validate common fields present in all driver exams
  validateCommonFields(formData);

  // Validate medical declaration and history
  validateMedicalDeclaration(formData.medicalDeclaration);
  validateMedicalHistory(formData.medicalHistory);

  // TP-specific validations
  if (requiresTpValidation(examType)) {
    validateAmt(formData.amt);
  }

  // LTA-specific validations
  if (requiresLtaValidation(examType)) {
    validateLtaVocational(formData.ltaVocational);
  }

  // Validate assessment section
  validateAssessment(formData.assessment, examType);
}
