import { describe, it, expect } from 'vitest';
import { calculateAge, formatAge } from './ageCalculation';

describe('calculateAge', () => {
  describe('Basic age calculation', () => {
    it('should calculate age correctly when months and days align', () => {
      const result = calculateAge('1960-10-15', '2025-10-15');
      expect(result).toEqual({ years: 65, months: 0, days: 0 });
    });

    it('should calculate age with days when birthdate has not occurred in current month', () => {
      const result = calculateAge('1960-10-15', '2025-11-01');
      expect(result).toEqual({ years: 65, months: 0, days: 17 });
    });

    it('should calculate age correctly with partial months', () => {
      const result = calculateAge('1960-10-15', '2025-12-30');
      expect(result).toEqual({ years: 65, months: 2, days: 15 });
    });

    it('should calculate age when exam is before birthday in year', () => {
      const result = calculateAge('1960-12-15', '2025-10-01');
      expect(result).toEqual({ years: 64, months: 9, days: 16 });
    });

    it('should calculate age correctly across year boundary', () => {
      const result = calculateAge('1960-01-15', '2025-12-31');
      expect(result).toEqual({ years: 65, months: 11, days: 16 });
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate correct age for user born Oct 15, 1960, exam on Oct 30, 2025', () => {
      const result = calculateAge('1960-10-15', '2025-10-30');
      expect(result).toEqual({ years: 65, months: 0, days: 15 });
    });

    it('should calculate correct age when exactly 65 years old', () => {
      const result = calculateAge('1960-06-15', '2025-06-15');
      expect(result).toEqual({ years: 65, months: 0, days: 0 });
    });

    it('should calculate age at 65 years 2 months 5 days', () => {
      const result = calculateAge('1960-06-15', '2025-08-20');
      expect(result).toEqual({ years: 65, months: 2, days: 5 });
    });

    it('should calculate age at 68 years 1 month 5 days', () => {
      const result = calculateAge('1957-05-20', '2025-06-25');
      expect(result).toEqual({ years: 68, months: 1, days: 5 });
    });

    it('should calculate age at 70 years exactly', () => {
      const result = calculateAge('1955-11-01', '2025-11-01');
      expect(result).toEqual({ years: 70, months: 0, days: 0 });
    });
  });

  describe('Edge cases', () => {
    it('should return null when DOB is empty', () => {
      const result = calculateAge('', '2025-11-01');
      expect(result).toBeNull();
    });

    it('should return null when reference date is empty', () => {
      const result = calculateAge('1960-06-15', '');
      expect(result).toBeNull();
    });

    it('should return null when both dates are empty', () => {
      const result = calculateAge('', '');
      expect(result).toBeNull();
    });

    it('should return null when DOB is invalid', () => {
      const result = calculateAge('invalid-date', '2025-11-01');
      expect(result).toBeNull();
    });

    it('should return null when reference date is invalid', () => {
      const result = calculateAge('1960-06-15', 'not-a-date');
      expect(result).toBeNull();
    });

    it('should handle leap year birthdays correctly', () => {
      const result = calculateAge('1960-02-29', '2025-03-01');
      expect(result).toEqual({ years: 65, months: 0, days: 1 });
    });

    it('should handle leap year birthday on non-leap year', () => {
      const result = calculateAge('1960-02-29', '2025-02-28');
      expect(result).toEqual({ years: 64, months: 11, days: 30 });
    });
  });

  describe('Month boundary calculations', () => {
    it('should handle end of month correctly', () => {
      const result = calculateAge('1960-01-31', '2025-02-28');
      expect(result).toEqual({ years: 64, months: 11, days: 28 });
    });

    it('should calculate correctly when born at end of month', () => {
      const result = calculateAge('1960-08-31', '2025-09-15');
      expect(result).toEqual({ years: 65, months: 0, days: 15 });
    });

    it('should handle when day of month is earlier in reference month', () => {
      const result = calculateAge('1960-06-25', '2025-07-10');
      expect(result).toEqual({ years: 65, months: 0, days: 15 });
    });

    it('should calculate months correctly when day hasnt occurred yet in current month', () => {
      const result = calculateAge('1960-06-25', '2025-08-10');
      expect(result).toEqual({ years: 65, months: 1, days: 16 });
    });
  });

  describe('Very old ages', () => {
    it('should calculate age correctly for 80 years old', () => {
      const result = calculateAge('1945-03-15', '2025-11-01');
      expect(result).toEqual({ years: 80, months: 7, days: 17 });
    });

    it('should calculate age correctly for 90 years old', () => {
      const result = calculateAge('1935-06-20', '2025-06-20');
      expect(result).toEqual({ years: 90, months: 0, days: 0 });
    });
  });

  describe('Young ages', () => {
    it('should calculate age correctly for someone under 65', () => {
      const result = calculateAge('1970-04-10', '2025-11-01');
      expect(result).toEqual({ years: 55, months: 6, days: 22 });
    });

    it('should calculate age for 30 year old', () => {
      const result = calculateAge('1995-01-15', '2025-01-15');
      expect(result).toEqual({ years: 30, months: 0, days: 0 });
    });
  });
});

describe('formatAge', () => {
  it('should format age with years, months, and days correctly', () => {
    const result = formatAge({ years: 65, months: 2, days: 15 });
    expect(result).toBe('65 years 2 months 15 days');
  });

  it('should format age with only years when months and days are 0', () => {
    const result = formatAge({ years: 65, months: 0, days: 0 });
    expect(result).toBe('65 years');
  });

  it('should format age with years and months when days is 0', () => {
    const result = formatAge({ years: 65, months: 2, days: 0 });
    expect(result).toBe('65 years 2 months');
  });

  it('should format age with years and days when months is 0', () => {
    const result = formatAge({ years: 65, months: 0, days: 15 });
    expect(result).toBe('65 years 15 days');
  });

  it('should use singular "year" when years is 1', () => {
    const result = formatAge({ years: 1, months: 5, days: 10 });
    expect(result).toBe('1 year 5 months 10 days');
  });

  it('should use singular "month" when months is 1', () => {
    const result = formatAge({ years: 65, months: 1, days: 15 });
    expect(result).toBe('65 years 1 month 15 days');
  });

  it('should use singular "day" when days is 1', () => {
    const result = formatAge({ years: 65, months: 2, days: 1 });
    expect(result).toBe('65 years 2 months 1 day');
  });

  it('should handle singular year, month, and day', () => {
    const result = formatAge({ years: 1, months: 1, days: 1 });
    expect(result).toBe('1 year 1 month 1 day');
  });

  it('should return empty string when age is null', () => {
    const result = formatAge(null);
    expect(result).toBe('');
  });

  it('should format 0 years correctly with months and days', () => {
    const result = formatAge({ years: 0, months: 6, days: 15 });
    expect(result).toBe('6 months 15 days');
  });

  it('should format 0 years and 0 months correctly', () => {
    const result = formatAge({ years: 0, months: 0, days: 15 });
    expect(result).toBe('15 days');
  });

  it('should format very large ages correctly', () => {
    const result = formatAge({ years: 100, months: 11, days: 25 });
    expect(result).toBe('100 years 11 months 25 days');
  });
});
