import { describe, it, expect } from 'vitest';
import { validateDrivingLicenceExamTiming, getDrivingLicenceExamGuidance } from './drivingLicenceValidation';

describe('validateDrivingLicenceExamTiming', () => {
  describe('Class 2B/2A/2/3C(A)/3C/3A/3 - 3-year interval exams', () => {
    const class2And3 = ['2B', '2A', '2', '3C(A)', '3C', '3A', '3'];

    class2And3.forEach((licenceClass) => {
      describe(`Class ${licenceClass}`, () => {
        it('should fail when patient is under 65 and more than 2 months before 65th birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1961-12-01', // Born Dec 1, 1961, turns 65 on Dec 1, 2026
            '2026-09-15',  // Sep 15, 2026 - more than 2 months before 65th birthday
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('too early');
          expect(result.error).toContain('65th birthday');
        });

        it('should pass when patient is within 2 months before turning 65', () => {
          const result = validateDrivingLicenceExamTiming(
            '1961-12-01', // Born Dec 1, 1961, turns 65 on Dec 1, 2026
            '2026-10-15',  // Oct 15, 2026 - within 2 months before 65th birthday
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.nextRequiredAge).toBe(65);
          expect(result.nextBirthdayDate).toEqual(new Date('2026-12-01'));
        });

        it('should pass when patient is well under 65 (e.g., 50 years old)', () => {
          const result = validateDrivingLicenceExamTiming(
            '1975-06-15', // ~50 years old
            '2025-11-01',
            licenceClass
          );
          expect(result.isValid).toBe(false); // Should fail - too early before 65
          expect(result.error).toContain('too early');
        });

        it('should pass when exam is within 2 months before 65th birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-12-01', // Born Dec 1, 1960, turning 65 on Dec 1, 2025
            '2025-10-15',  // Oct 15, 2025 (within 2 months before)
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.nextRequiredAge).toBe(65);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-12-01'));
        });

        it('should pass when exam is on the 65th birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-12-01',
            '2025-12-01',  // Exactly on 65th birthday
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(65);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-12-01'));
        });

        it('should fail when exam is more than 2 months before 65th birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-12-01',
            '2025-09-15',  // More than 2 months before birthday
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('too early');
        });

        it('should pass for exam at age 68', () => {
          const result = validateDrivingLicenceExamTiming(
            '1957-06-15', // Born Jun 15, 1957, turning 68 on Jun 15, 2025
            '2025-05-01',  // Within 2 months before
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(68);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-06-15'));
        });

        it('should pass for exam at age 71', () => {
          const result = validateDrivingLicenceExamTiming(
            '1954-08-20', // Born Aug 20, 1954, turning 71 on Aug 20, 2025
            '2025-07-15',  // Within 2 months before
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(71);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-08-20'));
        });

        it('should pass for exam at age 74', () => {
          const result = validateDrivingLicenceExamTiming(
            '1951-10-10', // Born Oct 10, 1951, turning 74 on Oct 10, 2025
            '2025-09-20',  // Within 2 months before
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(74);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-10-10'));
        });

        it('should pass for exam at age 77 (3 years after 74)', () => {
          const result = validateDrivingLicenceExamTiming(
            '1948-05-25', // Born May 25, 1948, turning 77 on May 25, 2025
            '2025-04-10',  // Within 2 months before
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(77);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-05-25'));
        });

        it('should pass for exam at age 80 (3 years after 77)', () => {
          const result = validateDrivingLicenceExamTiming(
            '1945-03-15', // Born Mar 15, 1945, turning 80 on Mar 15, 2025
            '2025-02-01',  // Within 2 months before
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(80);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-03-15'));
        });

        it('should fail when exam is at age 66 (not a required age)', () => {
          const result = validateDrivingLicenceExamTiming(
            '1959-06-15', // Born Jun 15, 1959, currently 66
            '2025-11-01',  // Exam when 66
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Next exam required at age');
        });

        it('should fail when exam is at age 67 (not a required age)', () => {
          const result = validateDrivingLicenceExamTiming(
            '1958-06-15', // Born Jun 15, 1958, currently 67
            '2025-11-01',
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Next exam required at age 68');
        });

        it('should fail when exam is at age 75 (not a required age for this class)', () => {
          const result = validateDrivingLicenceExamTiming(
            '1950-06-15', // Born Jun 15, 1950, currently 75
            '2025-11-01',
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Next exam required at age 77');
        });

        it('should pass when exam is after 65th birthday (real scenario: DOB Oct 15, 1960, exam Oct 30, 2025)', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-10-15', // Born Oct 15, 1960, turned 65 on Oct 15, 2025
            '2025-10-30',  // Exam on Oct 30, 2025 (15 days after 65th birthday)
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(65);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-10-15'));
        });

        it('should pass when exam is shortly after required birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-10-15', // Born Oct 15, turning 65
            '2025-10-20',  // 5 days after 65th birthday
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(65);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-10-15'));
        });
      });
    });
  });

  describe('Class 4/4A/5 - Annual exams from 65 to 75', () => {
    const class4And5 = ['4', '4A', '5'];

    class4And5.forEach((licenceClass) => {
      describe(`Class ${licenceClass}`, () => {
        it('should fail when patient is under 65 and more than 2 months before 65th birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1961-12-01', // Born Dec 1, 1961, turns 65 on Dec 1, 2026
            '2026-09-15',  // More than 2 months before
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('too early');
          expect(result.error).toContain('65th birthday');
        });

        it('should pass when patient is within 2 months before turning 65', () => {
          const result = validateDrivingLicenceExamTiming(
            '1961-12-01',
            '2026-10-15',  // Within 2 months before 65th birthday
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(65);
          expect(result.nextBirthdayDate).toEqual(new Date('2026-12-01'));
        });

        it('should fail when patient is well under 65', () => {
          const result = validateDrivingLicenceExamTiming(
            '1975-06-15', // ~50 years old
            '2025-11-01',
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('too early');
        });

        it('should pass when exam is within 2 months before 65th birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-12-01',
            '2025-10-15',
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(65);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-12-01'));
        });

        it('should pass for exam at age 66', () => {
          const result = validateDrivingLicenceExamTiming(
            '1959-06-15', // Born Jun 15, 1959
            '2025-05-01',  // Within 2 months before 66th birthday
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(66);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-06-15'));
        });

        it('should pass for exam at age 70', () => {
          const result = validateDrivingLicenceExamTiming(
            '1955-08-20',
            '2025-07-15',
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(70);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-08-20'));
        });

        it('should pass for exam at age 75', () => {
          const result = validateDrivingLicenceExamTiming(
            '1950-10-10',
            '2025-09-20',
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBeUndefined(); // No next age after 75
          expect(result.nextBirthdayDate).toEqual(new Date('2025-10-10'));
        });

        it('should fail when exam is more than 2 months before birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-12-01', // Turning 65 on Dec 1, 2025
            '2025-09-15',  // More than 2 months before
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('too early');
        });

        it('should fail when exam is at age 76', () => {
          const result = validateDrivingLicenceExamTiming(
            '1949-06-15', // Born Jun 15, 1949, currently 76
            '2025-11-01',
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('only until age 75');
        });

        it('should fail when exam is at age 80', () => {
          const result = validateDrivingLicenceExamTiming(
            '1945-03-15',
            '2025-11-01',
            licenceClass
          );
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('only until age 75');
        });

        it('should pass when exam is after 65th birthday (real scenario: DOB Oct 15, 1960, exam Oct 30, 2025)', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-10-15', // Born Oct 15, 1960, turned 65 on Oct 15, 2025
            '2025-10-30',  // Exam on Oct 30, 2025 (15 days after 65th birthday)
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.nextRequiredAge).toBe(66);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-10-15'));
        });

        it('should pass when exam is on the 65th birthday', () => {
          const result = validateDrivingLicenceExamTiming(
            '1960-10-15',
            '2025-10-15',  // Exactly on 65th birthday
            licenceClass
          );
          expect(result.isValid).toBe(true);
          expect(result.nextRequiredAge).toBe(66);
          expect(result.nextBirthdayDate).toEqual(new Date('2025-10-15'));
        });
      });
    });
  });

  describe('Other licence classes (4P, 4AP)', () => {
    it('should pass for class 4P with no age restrictions', () => {
      const result = validateDrivingLicenceExamTiming(
        '1950-06-15',
        '2025-11-01',
        '4P'
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass for class 4AP with no age restrictions', () => {
      const result = validateDrivingLicenceExamTiming(
        '1945-03-15',
        '2025-11-01',
        '4AP'
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass for class 4P even when under 65', () => {
      const result = validateDrivingLicenceExamTiming(
        '1975-06-15', // ~50 years old
        '2025-11-01',
        '4P'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should skip validation when DOB is missing', () => {
      const result = validateDrivingLicenceExamTiming(
        '',
        '2025-11-01',
        '3'
      );
      expect(result.isValid).toBe(true);
    });

    it('should skip validation when exam date is missing', () => {
      const result = validateDrivingLicenceExamTiming(
        '1960-06-15',
        '',
        '3'
      );
      expect(result.isValid).toBe(true);
    });

    it('should skip validation when licence class is missing', () => {
      const result = validateDrivingLicenceExamTiming(
        '1960-06-15',
        '2025-11-01',
        ''
      );
      expect(result.isValid).toBe(true);
    });

    it('should handle leap year birthdays correctly', () => {
      const result = validateDrivingLicenceExamTiming(
        '1960-02-29', // Leap year birthday
        '2025-01-15',  // Within 2 months before next birthday
        '3'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Birthday calculation accuracy', () => {
    it('should fail when exam is before the 2-month window for turning 65', () => {
      // Patient born Dec 15, exam on Sep 1 (more than 2 months before 65th birthday)
      const result = validateDrivingLicenceExamTiming(
        '1961-12-15', // Born Dec 15, 1961, turns 65 on Dec 15, 2026
        '2026-09-01',  // Exam on Sep 1, 2026 (more than 2 months before)
        '3'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too early');
    });

    it('should pass when exam is within 2 months of turning 65', () => {
      // Patient born Dec 15, exam on Oct 20
      const result = validateDrivingLicenceExamTiming(
        '1961-12-15', // Born Dec 15, 1961, turns 65 on Dec 15, 2026  
        '2026-10-20',  // Exam on Oct 20, 2026 (within 2 months)
        '3'
      );
      expect(result.isValid).toBe(true);
    });

    it('should correctly calculate age when birthday has occurred this year', () => {
      // Patient born Jan 15, exam on Dec 1 (after birthday)
      const result = validateDrivingLicenceExamTiming(
        '1960-01-15', // Born Jan 15, 1960
        '2025-12-01',  // Exam on Dec 1, 2025 (patient is 65)
        '3'
      );
      // Patient is 65, exam is not within 2 months of required birthday
      expect(result.isValid).toBe(false);
    });
  });

  describe('Two-month window validation', () => {
    it('should pass when exam is exactly 2 months before birthday', () => {
      const result = validateDrivingLicenceExamTiming(
        '1960-12-01',
        '2025-10-01', // Exactly 2 months before
        '3'
      );
      expect(result.isValid).toBe(true);
      expect(result.nextRequiredAge).toBe(65);
      expect(result.nextBirthdayDate).toEqual(new Date('2025-12-01'));
    });

    it('should pass when exam is 1 day before birthday', () => {
      const result = validateDrivingLicenceExamTiming(
        '1960-12-01',
        '2025-11-30',
        '3'
      );
      expect(result.isValid).toBe(true);
      expect(result.nextRequiredAge).toBe(65);
      expect(result.nextBirthdayDate).toEqual(new Date('2025-12-01'));
    });

    it('should fail when exam is 2 months and 1 day before birthday', () => {
      const result = validateDrivingLicenceExamTiming(
        '1960-12-01',
        '2025-09-30', // 2 months and 1 day before
        '3'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too early');
    });
  });
});

describe('getDrivingLicenceExamGuidance', () => {
  it('should return guidance for Class 2/3 under 65', () => {
    const guidance = getDrivingLicenceExamGuidance('1970-06-15', '3');
    expect(guidance).toContain('within 2 months before your 65th birthday');
    expect(guidance).toContain('ages 68, 71, 74');
    expect(guidance).toContain('every 3 years thereafter');
  });

  it('should return guidance for Class 4/5 under 65', () => {
    const guidance = getDrivingLicenceExamGuidance('1970-06-15', '4');
    expect(guidance).toContain('within 2 months before your 65th birthday');
    expect(guidance).toContain('annually from age 65 to 75');
  });

  it('should return guidance for Class 2/3 over 65', () => {
    const guidance = getDrivingLicenceExamGuidance('1955-06-15', '3A');
    expect(guidance).toContain('within 2 months before your birthday');
    expect(guidance).toContain('ages 65, 68, 71, 74');
  });

  it('should return guidance for Class 4/5 over 65', () => {
    const guidance = getDrivingLicenceExamGuidance('1955-06-15', '5');
    expect(guidance).toContain('within 2 months before your birthday');
    expect(guidance).toContain('annually from age 65 to 75');
  });

  it('should return null when DOB is missing', () => {
    const guidance = getDrivingLicenceExamGuidance('', '3');
    expect(guidance).toBeNull();
  });

  it('should return null when licence class is missing', () => {
    const guidance = getDrivingLicenceExamGuidance('1970-06-15', '');
    expect(guidance).toBeNull();
  });

  it('should return null for class 4P (no specific guidance)', () => {
    const guidance = getDrivingLicenceExamGuidance('1970-06-15', '4P');
    expect(guidance).toBeNull();
  });
});
