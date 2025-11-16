import {
  isShortDriverExam,
  validateShortDriverExam,
  PURPOSE_AGE_65_ABOVE_TP_ONLY,
  PURPOSE_AGE_65_ABOVE_TP_LTA,
  PURPOSE_AGE_64_BELOW_LTA_ONLY,
  PURPOSE_BAVL_ANY_AGE,
} from './driver-exam-short.validation';
import { CreateSubmissionDto } from '../dto/submission.dto';

describe('driver-exam-short.validation', () => {
  describe('isShortDriverExam', () => {
    it('should return true for DRIVING_LICENCE_TP_SHORT', () => {
      expect(isShortDriverExam('DRIVING_LICENCE_TP_SHORT')).toBe(true);
    });

    it('should return true for DRIVING_VOCATIONAL_TP_LTA_SHORT', () => {
      expect(isShortDriverExam('DRIVING_VOCATIONAL_TP_LTA_SHORT')).toBe(true);
    });

    it('should return true for VOCATIONAL_LICENCE_LTA_SHORT', () => {
      expect(isShortDriverExam('VOCATIONAL_LICENCE_LTA_SHORT')).toBe(true);
    });

    it('should return false for long form driver exams', () => {
      expect(isShortDriverExam('DRIVING_LICENCE_TP')).toBe(false);
      expect(isShortDriverExam('DRIVING_VOCATIONAL_TP_LTA')).toBe(false);
      expect(isShortDriverExam('VOCATIONAL_LICENCE_LTA')).toBe(false);
    });

    it('should return false for non-driver exams', () => {
      expect(isShortDriverExam('SIX_MONTHLY_MDW')).toBe(false);
      expect(isShortDriverExam('AGED_DRIVERS')).toBe(false);
    });
  });

  describe('validateShortDriverExam', () => {
    const createValidDto = (purpose: string, fitnessData: any): CreateSubmissionDto => ({
      examType: 'DRIVING_LICENCE_TP_SHORT',
      patientName: 'John Doe',
      patientNric: 'S1234567D',
      patientMobile: '+6591234567',
      examinationDate: '2024-01-15',
      purposeOfExam: purpose,
      clinicId: '123',
      formData: {
        ...fitnessData,
        declarationAgreed: true,
      },
    });

    describe('Patient NRIC validation', () => {
      it('should throw when NRIC is missing', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.patientNric = '';
        
        expect(() => validateShortDriverExam(dto)).toThrow('Patient NRIC is required');
      });

      it('should throw when NRIC format is invalid', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.patientNric = 'INVALID123';
        
        expect(() => validateShortDriverExam(dto)).toThrow('Invalid NRIC format');
      });

      it('should accept valid NRIC formats', () => {
        const validNrics = ['S1234567D', 'T9876543Z', 'F1234567M', 'G7654321A'];
        
        validNrics.forEach(nric => {
          const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
          dto.patientNric = nric;
          
          expect(() => validateShortDriverExam(dto)).not.toThrow();
        });
      });
    });

    describe('Patient Name validation', () => {
      it('should throw when name is missing', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.patientName = '';
        
        expect(() => validateShortDriverExam(dto)).toThrow('Patient name is required');
      });

      it('should throw when name is only whitespace', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.patientName = '   ';
        
        expect(() => validateShortDriverExam(dto)).toThrow('Patient name is required');
      });
    });

    describe('Mobile Number validation', () => {
      it('should throw when mobile number is missing', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.patientMobile = '';
        
        expect(() => validateShortDriverExam(dto)).toThrow('Mobile number is required');
      });

      it('should throw when mobile number format is invalid', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.patientMobile = '91234567'; // Missing +65
        
        expect(() => validateShortDriverExam(dto)).toThrow('Invalid mobile number format');
      });

      it('should throw when mobile number has wrong digit count', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.patientMobile = '+659123456'; // Only 7 digits
        
        expect(() => validateShortDriverExam(dto)).toThrow('Invalid mobile number format');
      });

      it('should accept valid mobile number', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.patientMobile = '+6591234567';
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });
    });

    describe('Examination Date validation', () => {
      it('should throw when examination date is missing', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.examinationDate = '';
        
        expect(() => validateShortDriverExam(dto)).toThrow('Examination date is required');
      });
    });

    describe('Purpose of Exam validation', () => {
      it('should throw when purpose is missing', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.purposeOfExam = '';
        
        expect(() => validateShortDriverExam(dto)).toThrow('Purpose of exam is required');
      });

      it('should throw when purpose is invalid', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.purposeOfExam = 'INVALID_PURPOSE';
        
        expect(() => validateShortDriverExam(dto)).toThrow('Invalid purpose of exam');
      });

      it('should accept all valid purposes', () => {
        const validPurposes = [
          PURPOSE_AGE_65_ABOVE_TP_ONLY,
          PURPOSE_AGE_65_ABOVE_TP_LTA,
          PURPOSE_AGE_64_BELOW_LTA_ONLY,
          PURPOSE_BAVL_ANY_AGE,
        ];

        validPurposes.forEach(purpose => {
          const fitnessData = purpose === PURPOSE_AGE_65_ABOVE_TP_ONLY 
            ? { fitToDriveMotorVehicle: true }
            : purpose === PURPOSE_BAVL_ANY_AGE
            ? { fitForBavl: true }
            : { fitToDrivePsv: true, fitForBavl: true };
          const dto = createValidDto(purpose, fitnessData);
          
          expect(() => validateShortDriverExam(dto)).not.toThrow();
        });
      });
    });

    describe('Fitness Determination validation - Purpose 1 (Age 65+ TP only)', () => {
      it('should require fitToDriveMotorVehicle', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, {});
        
        expect(() => validateShortDriverExam(dto)).toThrow(
          'Fitness to drive motor vehicle determination is required',
        );
      });

      it('should accept fitToDriveMotorVehicle as true', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });

      it('should accept fitToDriveMotorVehicle as false', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: false });
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });
    });

    describe('Fitness Determination validation - Purpose 2 (Age 65+ TP & LTA)', () => {
      it('should require both fitness determinations', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_LTA, {});
        
        expect(() => validateShortDriverExam(dto)).toThrow(
          'Public service vehicle fitness determination is required',
        );
      });

      it('should require fitForBavl when only fitToDrivePsv provided', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_LTA, { fitToDrivePsv: true });
        
        expect(() => validateShortDriverExam(dto)).toThrow(
          'Bus attendant vocational licence fitness determination is required',
        );
      });

      it('should require fitToDrivePsv when only fitForBavl provided', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_LTA, { fitForBavl: true });
        
        expect(() => validateShortDriverExam(dto)).toThrow(
          'Public service vehicle fitness determination is required',
        );
      });

      it('should accept both determinations', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_LTA, {
          fitToDrivePsv: true,
          fitForBavl: false,
        });
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });
    });

    describe('Fitness Determination validation - Purpose 3 (Age 64 below LTA)', () => {
      it('should require both fitness determinations', () => {
        const dto = createValidDto(PURPOSE_AGE_64_BELOW_LTA_ONLY, {});
        
        expect(() => validateShortDriverExam(dto)).toThrow(
          'Public service vehicle fitness determination is required',
        );
      });

      it('should accept both determinations', () => {
        const dto = createValidDto(PURPOSE_AGE_64_BELOW_LTA_ONLY, {
          fitToDrivePsv: false,
          fitForBavl: true,
        });
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });
    });

    describe('Fitness Determination validation - Purpose 4 (BAVL any age)', () => {
      it('should require fitForBavl', () => {
        const dto = createValidDto(PURPOSE_BAVL_ANY_AGE, {});
        
        expect(() => validateShortDriverExam(dto)).toThrow(
          'Bus attendant vocational licence fitness determination is required',
        );
      });

      it('should accept fitForBavl', () => {
        const dto = createValidDto(PURPOSE_BAVL_ANY_AGE, { fitForBavl: true });
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });

      it('should not require other fitness determinations', () => {
        const dto = createValidDto(PURPOSE_BAVL_ANY_AGE, {
          fitForBavl: true,
          // No fitToDrivePsv or fitToDriveMotorVehicle
        });
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });
    });

    describe('Declaration validation', () => {
      it('should throw when declaration is not confirmed', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.formData.declarationAgreed = false;
        
        expect(() => validateShortDriverExam(dto)).toThrow('Declaration confirmation is required');
      });

      it('should accept when declaration is confirmed', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        dto.formData.declarationAgreed = true;
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });
    });

    describe('Short form does not require long form fields', () => {
      it('should accept submission without height/weight/BMI', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        // No height, weight, BMI fields in formData
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });

      it('should accept submission without DOB or email', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        // No DOB or email fields in patientInfo
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });

      it('should accept submission without medical history', () => {
        const dto = createValidDto(PURPOSE_AGE_65_ABOVE_TP_ONLY, { fitToDriveMotorVehicle: true });
        // No medicalDeclaration or medicalHistory in formData
        
        expect(() => validateShortDriverExam(dto)).not.toThrow();
      });
    });
  });
});
