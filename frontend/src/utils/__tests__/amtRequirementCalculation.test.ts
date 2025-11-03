import { describe, it, expect } from 'vitest';

/**
 * Unit tests for AMT requirement calculation logic
 * These tests verify the business rules for determining when AMT is required
 */

// Helper function that mimics the recalculateAMTRequirement logic from NewSubmission
function calculateAMTRequirement(params: {
  drivingLicenseClass: string;
  patientDateOfBirth: string;
  examinationDate: string;
  cognitiveImpairment: boolean;
  isPrivateDrivingInstructor?: 'yes' | 'no';
  holdsLTAVocationalLicence?: 'yes' | 'no';
}): boolean | null {
  const {
    drivingLicenseClass,
    patientDateOfBirth,
    examinationDate,
    cognitiveImpairment,
    isPrivateDrivingInstructor,
    holdsLTAVocationalLicence,
  } = params;

  if (!drivingLicenseClass || !patientDateOfBirth || !examinationDate) {
    return null; // Cannot determine
  }

  const AMT_AGE_CHECK_CLASSES = ['4', '4A', '4P', '4AP', '5', '5P'];

  const calculateAgeOnNextBirthday = (dob: string, examDate: string): number | null => {
    if (!dob || !examDate) return null;
    const dobDate = new Date(dob);
    const examDateObj = new Date(examDate);
    const nextBirthday = new Date(dobDate);
    nextBirthday.setFullYear(examDateObj.getFullYear());
    if (nextBirthday < examDateObj) {
      nextBirthday.setFullYear(examDateObj.getFullYear() + 1);
    }
    return nextBirthday.getFullYear() - dobDate.getFullYear();
  };

  const calculateAgeOnExamDate = (dob: string, examDate: string): number | null => {
    if (!dob || !examDate) return null;
    const dobDate = new Date(dob);
    const examDateObj = new Date(examDate);
    let age = examDateObj.getFullYear() - dobDate.getFullYear();
    const monthDiff = examDateObj.getMonth() - dobDate.getMonth();
    const dayDiff = examDateObj.getDate() - dobDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  };

  // Condition 3: Cognitive impairment
  if (cognitiveImpairment) {
    return true;
  }

  const ageNextBirthday = calculateAgeOnNextBirthday(patientDateOfBirth, examinationDate);
  const ageOnExamDate = calculateAgeOnExamDate(patientDateOfBirth, examinationDate);

  // Check if age is outside critical ranges
  const ageOutsideCriticalRange =
    (ageNextBirthday !== null && (ageNextBirthday < 70 || ageNextBirthday > 74)) &&
    (ageOnExamDate !== null && ageOnExamDate < 70);

  if (ageOutsideCriticalRange) {
    return false; // AMT definitely not required
  }

  // Condition 1: Class 4/4A/4P/4AP/5/5P or Private Driving Instructor AND next birthday age 70-74
  if (ageNextBirthday !== null && ageNextBirthday >= 70 && ageNextBirthday <= 74) {
    const isAMTAgeCheckClass = AMT_AGE_CHECK_CLASSES.includes(drivingLicenseClass);
    if (isAMTAgeCheckClass || isPrivateDrivingInstructor === 'yes') {
      return true;
    }
  }

  // Condition 2: LTA vocational licence AND aged 70+ on examination date
  if (ageOnExamDate !== null && ageOnExamDate >= 70) {
    if (holdsLTAVocationalLicence === 'yes') {
      return true;
    }
  }

  // Need more info if we can't make determination
  if (isPrivateDrivingInstructor === undefined || holdsLTAVocationalLicence === undefined) {
    return null;
  }

  return false; // AMT not required
}

describe('AMT Requirement Calculation - Business Logic', () => {
  const EXAM_DATE = '2025-11-03';

  describe('Cognitive Impairment', () => {
    it('should require AMT when cognitive impairment is true regardless of age', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1990-01-01', // Age 35
        examinationDate: EXAM_DATE,
        cognitiveImpairment: true,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(true);
    });

    it('should not require AMT for young patient without cognitive impairment', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1990-01-01', // Age 35
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(false);
    });
  });

  describe('Age and License Class Combinations', () => {
    it('should require AMT for age 70-74 with license class 4', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1953-01-01', // Age 72
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(true);
    });

    it('should require AMT for age 70-74 with license class 5', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '5',
        patientDateOfBirth: '1952-06-15', // Age 73
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(true);
    });

    it('should require AMT for all AMT check classes (4, 4A, 4P, 4AP, 5, 5P)', () => {
      const AMT_CLASSES = ['4', '4A', '4P', '4AP', '5', '5P'];

      AMT_CLASSES.forEach((licenseClass) => {
        const result = calculateAMTRequirement({
          drivingLicenseClass: licenseClass,
          patientDateOfBirth: '1953-01-01', // Age 72
          examinationDate: EXAM_DATE,
          cognitiveImpairment: false,
          isPrivateDrivingInstructor: 'no',
          holdsLTAVocationalLicence: 'no',
        });
        expect(result).toBe(true);
      });
    });

    it('should not require AMT for age 70-74 with non-AMT license classes', () => {
      const NON_AMT_CLASSES = ['1', '2', '2A', '2B', '3', '3A'];

      NON_AMT_CLASSES.forEach((licenseClass) => {
        const result = calculateAMTRequirement({
          drivingLicenseClass: licenseClass,
          patientDateOfBirth: '1953-01-01', // Age 72
          examinationDate: EXAM_DATE,
          cognitiveImpairment: false,
          isPrivateDrivingInstructor: 'no',
          holdsLTAVocationalLicence: 'no',
        });
        expect(result).toBe(false);
      });
    });

    it('should not require AMT for age below 70', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1960-01-01', // Age 65
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(false);
    });

    it('should not require AMT for age above 74 without LTA vocational license', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1948-01-01', // Age 77
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(false);
    });
  });

  describe('Private Driving Instructor', () => {
    it('should require AMT for private instructor aged 70-74', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B', // Non-AMT class
        patientDateOfBirth: '1953-01-01', // Age 72
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'yes',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(true);
    });

    it('should not require AMT for private instructor aged below 70', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1960-01-01', // Age 65
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'yes',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(false);
    });

    it('should not require AMT for non-instructor aged 70-74 with non-AMT class', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1953-01-01', // Age 72
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(false);
    });
  });

  describe('LTA Vocational License', () => {
    it('should require AMT for LTA vocational license holder aged 70+', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1953-01-01', // Age 72
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'yes',
      });
      expect(result).toBe(true);
    });

    it('should require AMT for LTA vocational license holder aged exactly 70', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1955-11-03', // Age exactly 70 on exam date
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'yes',
      });
      expect(result).toBe(true);
    });

    it('should not require AMT for LTA vocational license holder aged below 70', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1960-01-01', // Age 65
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'yes',
      });
      expect(result).toBe(false);
    });

    it('should not require AMT for non-LTA license holder aged 70+', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1953-01-01', // Age 72
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(false);
    });
  });

  describe('Uncertain Cases (Missing Information)', () => {
    it('should return null when private instructor status is undefined', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1953-01-01', // Age 72
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: undefined,
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(null);
    });

    it('should return null when LTA vocational license status is undefined', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1953-01-01', // Age 72
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: undefined,
      });
      expect(result).toBe(null);
    });

    it('should return null when both statuses are undefined', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '2B',
        patientDateOfBirth: '1953-01-01',
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: undefined,
        holdsLTAVocationalLicence: undefined,
      });
      expect(result).toBe(null);
    });

    it('should return null when license class is missing', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '',
        patientDateOfBirth: '1953-01-01',
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(null);
    });

    it('should return null when date of birth is missing', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '',
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(null);
    });

    it('should return null when examination date is missing', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1953-01-01',
        examinationDate: '',
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle birthday on exam date correctly', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1953-11-03', // Birthday on exam date, turns 72
        examinationDate: '2025-11-03',
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      expect(result).toBe(true);
    });

    it('should handle patient turning 70 next year', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1956-01-01', // Age 69, turning 70 next birthday
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      // Age on next birthday is 70, which is in range 70-74
      expect(result).toBe(true);
    });

    it('should handle multiple conditions requiring AMT', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4', // AMT class
        patientDateOfBirth: '1953-01-01', // Age 72
        examinationDate: EXAM_DATE,
        cognitiveImpairment: true, // Also has cognitive impairment
        isPrivateDrivingInstructor: 'yes', // And is instructor
        holdsLTAVocationalLicence: 'yes', // And has LTA license
      });
      expect(result).toBe(true); // Multiple reasons to require AMT
    });

    it('should not require AMT when only one condition met but outside age range', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1990-01-01', // Age 35, too young
        examinationDate: EXAM_DATE,
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'yes',
        holdsLTAVocationalLicence: 'yes',
      });
      expect(result).toBe(false); // Too young despite other factors
    });
  });

  describe('Age Calculation Accuracy', () => {
    it('should calculate age correctly when birthday has not occurred this year', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1953-12-31', // Birthday later in year
        examinationDate: '2025-01-01', // Exam early in year
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      // Age on exam date is 71, age on next birthday is 72
      expect(result).toBe(true);
    });

    it('should calculate age correctly when birthday has occurred this year', () => {
      const result = calculateAMTRequirement({
        drivingLicenseClass: '4',
        patientDateOfBirth: '1953-01-01', // Birthday early in year
        examinationDate: '2025-12-31', // Exam late in year
        cognitiveImpairment: false,
        isPrivateDrivingInstructor: 'no',
        holdsLTAVocationalLicence: 'no',
      });
      // Age on exam date is 72, age on next birthday is 73
      expect(result).toBe(true);
    });
  });
});
