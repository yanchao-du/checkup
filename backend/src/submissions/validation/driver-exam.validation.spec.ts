import {
  validateDriverExam,
  validateExamTiming,
  validateAmt,
  validateLtaVocational,
  validateAssessment,
  validateMedicalDeclaration,
  validateMedicalHistory,
  validateCommonFields,
  isDriverExam,
  requiresTpValidation,
  requiresLtaValidation,
} from './driver-exam.validation';
import { CreateSubmissionDto } from '../dto/submission.dto';
import { BadRequestException } from '@nestjs/common';

describe('Driver Exam Validation', () => {
  describe('isDriverExam', () => {
    it('should return true for DRIVING_LICENCE_TP', () => {
      expect(isDriverExam('DRIVING_LICENCE_TP')).toBe(true);
    });

    it('should return true for DRIVING_VOCATIONAL_TP_LTA', () => {
      expect(isDriverExam('DRIVING_VOCATIONAL_TP_LTA')).toBe(true);
    });

    it('should return true for VOCATIONAL_LICENCE_LTA', () => {
      expect(isDriverExam('VOCATIONAL_LICENCE_LTA')).toBe(true);
    });

    it('should return false for non-driver exam types', () => {
      expect(isDriverExam('SIX_MONTHLY_MDW')).toBe(false);
      expect(isDriverExam('WORK_PERMIT')).toBe(false);
      expect(isDriverExam('AGED_DRIVERS')).toBe(false);
    });
  });

  describe('requiresTpValidation', () => {
    it('should return true for DRIVING_LICENCE_TP', () => {
      expect(requiresTpValidation('DRIVING_LICENCE_TP')).toBe(true);
    });

    it('should return true for DRIVING_VOCATIONAL_TP_LTA', () => {
      expect(requiresTpValidation('DRIVING_VOCATIONAL_TP_LTA')).toBe(true);
    });

    it('should return false for VOCATIONAL_LICENCE_LTA', () => {
      expect(requiresTpValidation('VOCATIONAL_LICENCE_LTA')).toBe(false);
    });
  });

  describe('requiresLtaValidation', () => {
    it('should return true for DRIVING_VOCATIONAL_TP_LTA', () => {
      expect(requiresLtaValidation('DRIVING_VOCATIONAL_TP_LTA')).toBe(true);
    });

    it('should return true for VOCATIONAL_LICENCE_LTA', () => {
      expect(requiresLtaValidation('VOCATIONAL_LICENCE_LTA')).toBe(true);
    });

    it('should return false for DRIVING_LICENCE_TP', () => {
      expect(requiresLtaValidation('DRIVING_LICENCE_TP')).toBe(false);
    });
  });

  describe('validateExamTiming', () => {
    it('should pass when exam date is within 2 months before birthday', () => {
      const patientDateOfBirth = '1990-06-15'; // Birthday on June 15
      const examinationDate = '2024-05-01'; // About 1.5 months before birthday

      expect(() => validateExamTiming(patientDateOfBirth, examinationDate)).not.toThrow();
    });

    it('should pass when exam date is exactly 2 months before birthday', () => {
      const patientDateOfBirth = '1990-06-15';
      const examinationDate = '2024-04-15'; // Exactly 2 months before

      expect(() => validateExamTiming(patientDateOfBirth, examinationDate)).not.toThrow();
    });

    it('should throw when exam date is more than 2 months before birthday', () => {
      const patientDateOfBirth = '1990-06-15';
      const examinationDate = '2024-03-01'; // More than 2 months before

      expect(() => validateExamTiming(patientDateOfBirth, examinationDate)).toThrow(BadRequestException);
      expect(() => validateExamTiming(patientDateOfBirth, examinationDate)).toThrow(
        /within 2 months before the examinee/,
      );
    });

    it('should pass when exam date is on birthday', () => {
      const patientDateOfBirth = '1990-06-15';
      const examinationDate = '2024-06-15'; // On birthday

      expect(() => validateExamTiming(patientDateOfBirth, examinationDate)).not.toThrow();
    });

    it('should throw when exam date is after birthday', () => {
      const patientDateOfBirth = '2000-06-15';
      const examinationDate = '2024-07-01'; // After birthday

      expect(() => validateExamTiming(patientDateOfBirth, examinationDate)).toThrow(BadRequestException);
    });
  });

  describe('validateAmt', () => {
    it('should pass when AMT score is 8 or higher', () => {
      const amt = {
        age: true,
        time: true,
        address: true,
        year: true,
        place: true,
        twoPersons: true,
        dateOfBirth: true,
        yearWw1: true,
        nameOfPm: false,
        countBackwards: false,
        score: 8,
      };

      expect(() => validateAmt(amt)).not.toThrow();
    });

    it('should pass when AMT score is 10 (perfect)', () => {
      const amt = {
        age: true,
        time: true,
        address: true,
        year: true,
        place: true,
        twoPersons: true,
        dateOfBirth: true,
        yearWw1: true,
        nameOfPm: true,
        countBackwards: true,
        score: 10,
      };

      expect(() => validateAmt(amt)).not.toThrow();
    });

    it('should pass with AMT score of 7 (low but valid range)', () => {
      const amt = {
        score: 7,
        date: '2024-05-15',
      };

      expect(() => validateAmt(amt)).not.toThrow();
    });

    it('should throw when AMT object is missing', () => {
      expect(() => validateAmt(null)).toThrow(BadRequestException);
      expect(() => validateAmt(null)).toThrow(/Abbreviated Mental Test is required/);
    });

    it('should throw when AMT score is missing', () => {
      const amt = {
        age: true,
        time: true,
      };

      expect(() => validateAmt(amt)).toThrow(BadRequestException);
      expect(() => validateAmt(amt)).toThrow(/AMT score must be a number/);
    });

    it('should throw when AMT score is negative', () => {
      const amt = {
        score: -1,
      };

      expect(() => validateAmt(amt)).toThrow(BadRequestException);
      expect(() => validateAmt(amt)).toThrow(/AMT score must be between 0 and 10/);
    });

    it('should throw when AMT score is greater than 10', () => {
      const amt = {
        score: 11,
      };

      expect(() => validateAmt(amt)).toThrow(BadRequestException);
      expect(() => validateAmt(amt)).toThrow(/AMT score must be between 0 and 10/);
    });
  });

  describe('validateLtaVocational', () => {
    it('should pass with valid LTA vocational data', () => {
      const ltaVocational = {
        colorVision: 'Normal',
        peripheralVision: 'Normal',
        nightVision: 'Normal',
        fitForVocational: true,
      };

      expect(() => validateLtaVocational(ltaVocational)).not.toThrow();
    });

    it('should pass with fit for duty and restrictions', () => {
      const ltaVocational = {
        colorVision: 'Normal',
        peripheralVision: 'Normal',
        nightVision: 'Normal',
        fitForVocational: true,
        restrictions: 'Must wear corrective lenses',
      };

      expect(() => validateLtaVocational(ltaVocational)).not.toThrow();
    });

    it('should pass when not fit for vocational duty', () => {
      const ltaVocational = {
        colorVision: 'Abnormal',
        peripheralVision: 'Reduced',
        nightVision: 'Impaired',
        fitForVocational: false,
      };

      expect(() => validateLtaVocational(ltaVocational)).not.toThrow();
    });

    it('should throw when ltaVocational object is missing', () => {
      expect(() => validateLtaVocational(null)).toThrow(BadRequestException);
      expect(() => validateLtaVocational(null)).toThrow(
        /LTA Vocational Licence Medical Details are required/,
      );
    });

    it('should throw when colorVision is missing', () => {
      const ltaVocational = {
        peripheralVision: 'Normal',
        nightVision: 'Normal',
        fitForVocational: true,
      };

      expect(() => validateLtaVocational(ltaVocational)).toThrow(BadRequestException);
      expect(() => validateLtaVocational(ltaVocational)).toThrow(/colorVision is required/);
    });

    it('should throw when peripheralVision is missing', () => {
      const ltaVocational = {
        colorVision: 'Normal',
        nightVision: 'Normal',
        fitForVocational: true,
      };

      expect(() => validateLtaVocational(ltaVocational)).toThrow(BadRequestException);
      expect(() => validateLtaVocational(ltaVocational)).toThrow(/peripheralVision is required/);
    });

    it('should throw when nightVision is missing', () => {
      const ltaVocational = {
        colorVision: 'Normal',
        peripheralVision: 'Normal',
        fitForVocational: true,
      };

      expect(() => validateLtaVocational(ltaVocational)).toThrow(BadRequestException);
      expect(() => validateLtaVocational(ltaVocational)).toThrow(/nightVision is required/);
    });

    it('should throw when fitForVocational is missing', () => {
      const ltaVocational = {
        colorVision: 'Normal',
        peripheralVision: 'Normal',
        nightVision: 'Normal',
      };

      expect(() => validateLtaVocational(ltaVocational)).toThrow(BadRequestException);
      expect(() => validateLtaVocational(ltaVocational)).toThrow(
        /Fit for vocational duty determination is required/,
      );
    });
  });

  describe('validateAssessment', () => {
    it('should pass with valid TP-only assessment', () => {
      const assessment = {
        fitToDrive: true,
        requiresSpecialistReview: false,
        remarks: 'Patient is fit to drive',
      };

      expect(() => validateAssessment(assessment, 'DRIVING_LICENCE_TP')).not.toThrow();
    });

    it('should pass with valid LTA-only assessment', () => {
      const assessment = {
        fitForVocational: true,
        requiresSpecialistReview: false,
        remarks: 'Patient is fit for vocational duties',
      };

      expect(() => validateAssessment(assessment, 'VOCATIONAL_LICENCE_LTA')).not.toThrow();
    });

    it('should pass with valid combined TP+LTA assessment', () => {
      const assessment = {
        fitToDrive: true,
        fitForVocational: true,
        requiresSpecialistReview: false,
        remarks: 'Patient is fit for both driving and vocational duties',
      };

      expect(() => validateAssessment(assessment, 'DRIVING_VOCATIONAL_TP_LTA')).not.toThrow();
    });

    it('should pass with specialist review required', () => {
      const assessment = {
        fitToDrive: true,
        requiresSpecialistReview: true,
        specialistType: 'Cardiologist',
        remarks: 'Patient requires cardiology review',
      };

      expect(() => validateAssessment(assessment, 'DRIVING_LICENCE_TP')).not.toThrow();
    });

    it('should throw when assessment is missing', () => {
      expect(() => validateAssessment(null, 'DRIVING_LICENCE_TP')).toThrow(
        BadRequestException,
      );
      expect(() => validateAssessment(null, 'DRIVING_LICENCE_TP')).toThrow(
        /Medical practitioner assessment is required/,
      );
    });

    it('should throw when fitToDrive is missing for TP exam', () => {
      const assessment = {
        requiresSpecialistReview: false,
        remarks: 'Test remarks',
      };

      expect(() => validateAssessment(assessment, 'DRIVING_LICENCE_TP')).toThrow(
        BadRequestException,
      );
      expect(() => validateAssessment(assessment, 'DRIVING_LICENCE_TP')).toThrow(
        /Fitness to drive determination is required/,
      );
    });

    it('should throw when fitForVocational is missing for LTA exam', () => {
      const assessment = {
        requiresSpecialistReview: false,
        remarks: 'Test remarks',
      };

      expect(() => validateAssessment(assessment, 'VOCATIONAL_LICENCE_LTA')).toThrow(
        BadRequestException,
      );
      expect(() => validateAssessment(assessment, 'VOCATIONAL_LICENCE_LTA')).toThrow(
        /Fitness for vocational duty determination is required/,
      );
    });

    it('should throw when remarks are missing', () => {
      const assessment = {
        fitToDrive: true,
        requiresSpecialistReview: false,
      };

      expect(() => validateAssessment(assessment, 'DRIVING_LICENCE_TP')).toThrow(
        BadRequestException,
      );
      expect(() => validateAssessment(assessment, 'DRIVING_LICENCE_TP')).toThrow(
        /Medical practitioner remarks are required/,
      );
    });

    it('should throw when both TP and LTA assessments are missing for combined exam', () => {
      const assessment = {
        requiresSpecialistReview: false,
        remarks: 'Test remarks',
      };

      expect(() => validateAssessment(assessment, 'DRIVING_VOCATIONAL_TP_LTA')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateDriverExam', () => {
    it('should pass complete DRIVING_LICENCE_TP validation', () => {
      const dto: CreateSubmissionDto = {
        examType: 'DRIVING_LICENCE_TP',
        patientName: 'John Doe',
        patientNric: 'S1234567D',
        patientDateOfBirth: '1990-06-15',
        examinationDate: '2024-05-01',
        formData: {
          height: '170',
          weight: '70',
          bloodPressure: '120/80',
          pulse: '75',
          visualAcuity: '6/6',
          hearingTest: 'Normal',
          medicalDeclaration: {},
          medicalHistory: {},
          amt: {
            age: true,
            time: true,
            address: true,
            year: true,
            place: true,
            twoPersons: true,
            dateOfBirth: true,
            yearWw1: true,
            nameOfPm: true,
            countBackwards: true,
            score: 10,
          },
          assessment: {
            fitToDrive: true,
            requiresSpecialistReview: false,
            remarks: 'Patient is fit to drive',
          },
        },
      };

      expect(() => validateDriverExam(dto)).not.toThrow();
    });

    it('should pass complete VOCATIONAL_LICENCE_LTA validation', () => {
      const dto: CreateSubmissionDto = {
        examType: 'VOCATIONAL_LICENCE_LTA',
        patientName: 'Jane Smith',
        patientNric: 'S9876543A',
        patientDateOfBirth: '1985-03-20',
        examinationDate: '2024-02-15',
        formData: {
          height: '165',
          weight: '55',
          bloodPressure: '110/70',
          pulse: '70',
          visualAcuity: '6/6',
          hearingTest: 'Normal',
          medicalDeclaration: {},
          medicalHistory: {},
          ltaVocational: {
            colorVision: 'Normal',
            peripheralVision: 'Normal',
            nightVision: 'Normal',
            fitForVocational: true,
          },
          assessment: {
            fitForVocational: true,
            requiresSpecialistReview: false,
            remarks: 'Patient is fit for vocational duties',
          },
        },
      };

      expect(() => validateDriverExam(dto)).not.toThrow();
    });

    it('should pass complete DRIVING_VOCATIONAL_TP_LTA validation', () => {
      const dto: CreateSubmissionDto = {
        examType: 'DRIVING_VOCATIONAL_TP_LTA',
        patientName: 'Bob Lee',
        patientNric: 'S5555555B',
        patientDateOfBirth: '1980-12-10',
        examinationDate: '2024-11-01',
        formData: {
          height: '175',
          weight: '75',
          bloodPressure: '120/80',
          pulse: '72',
          visualAcuity: '6/6',
          hearingTest: 'Normal',
          medicalDeclaration: {},
          medicalHistory: {},
          amt: {
            age: true,
            time: true,
            address: true,
            year: true,
            place: true,
            twoPersons: true,
            dateOfBirth: true,
            yearWw1: false,
            nameOfPm: true,
            countBackwards: true,
            score: 9,
          },
          ltaVocational: {
            colorVision: 'Normal',
            peripheralVision: 'Normal',
            nightVision: 'Normal',
            fitForVocational: true,
          },
          assessment: {
            fitToDrive: true,
            fitForVocational: true,
            requiresSpecialistReview: false,
            remarks: 'Patient is fit for both',
          },
        },
      };

      expect(() => validateDriverExam(dto)).not.toThrow();
    });

    it('should do nothing for non-driver exam types', () => {
      const dto: CreateSubmissionDto = {
        examType: 'SIX_MONTHLY_MDW',
        patientName: 'Test Patient',
        patientNric: 'S1111111C',
        formData: {},
      };

      expect(() => validateDriverExam(dto)).not.toThrow();
    });

    it('should throw when exam timing is invalid', () => {
      const dto: CreateSubmissionDto = {
        examType: 'DRIVING_LICENCE_TP',
        patientName: 'John Doe',
        patientNric: 'S1234567D',
        patientDateOfBirth: '1990-06-15',
        examinationDate: '2024-03-01', // Too early
        formData: {
          amt: { score: 10 },
          assessment: {
            fitToDrive: true,
            requiresSpecialistReview: false,
            remarks: 'Test',
          },
        },
      };

      expect(() => validateDriverExam(dto)).toThrow(BadRequestException);
    });

    it('should throw when AMT validation fails for TP exam', () => {
      const dto: CreateSubmissionDto = {
        examType: 'DRIVING_LICENCE_TP',
        patientName: 'John Doe',
        patientNric: 'S1234567D',
        patientDateOfBirth: '1990-06-15',
        examinationDate: '2024-05-01',
        formData: {
          amt: { score: 5 }, // Too low
          assessment: {
            fitToDrive: true,
            requiresSpecialistReview: false,
            remarks: 'Test',
          },
        },
      };

      expect(() => validateDriverExam(dto)).toThrow(BadRequestException);
    });

    it('should throw when LTA vocational validation fails', () => {
      const dto: CreateSubmissionDto = {
        examType: 'VOCATIONAL_LICENCE_LTA',
        patientName: 'Jane Smith',
        patientNric: 'S9876543A',
        patientDateOfBirth: '1985-03-20',
        examinationDate: '2024-02-15',
        formData: {
          ltaVocational: {
            // Missing required fields
            colorVision: 'Normal',
          },
          assessment: {
            fitForVocationalDuty: true,
            requiresSpecialistReview: false,
            remarks: 'Test',
          },
        },
      };

      expect(() => validateDriverExam(dto)).toThrow(BadRequestException);
    });

    it('should throw when assessment validation fails', () => {
      const dto: CreateSubmissionDto = {
        examType: 'DRIVING_LICENCE_TP',
        patientName: 'John Doe',
        patientNric: 'S1234567D',
        patientDateOfBirth: '1990-06-15',
        examinationDate: '2024-05-01',
        formData: {
          amt: { score: 10 },
          assessment: {
            // Missing required remarks
            fitToDrive: true,
            requiresSpecialistReview: false,
          },
        },
      };

      expect(() => validateDriverExam(dto)).toThrow(BadRequestException);
    });
  });
});
