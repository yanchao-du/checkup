import { describe, it, expect } from 'vitest';
import { validateEmail, validateSingaporeMobile } from './validationRules';

describe('validateEmail', () => {
  describe('Valid email addresses', () => {
    it('should return null for valid email with standard format', () => {
      expect(validateEmail('user@example.com')).toBeNull();
    });

    it('should return null for email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBeNull();
    });

    it('should return null for email with plus sign', () => {
      expect(validateEmail('user+tag@example.com')).toBeNull();
    });

    it('should return null for email with dots in local part', () => {
      expect(validateEmail('first.last@example.com')).toBeNull();
    });

    it('should return null for email with numbers', () => {
      expect(validateEmail('user123@example456.com')).toBeNull();
    });

    it('should return null for email with hyphen in domain', () => {
      expect(validateEmail('user@my-domain.com')).toBeNull();
    });

    it('should return null for empty string (optional field)', () => {
      expect(validateEmail('')).toBeNull();
    });
  });

  describe('Invalid email addresses', () => {
    it('should return error for email without @', () => {
      expect(validateEmail('userexample.com')).toBe('Please enter a valid email address');
    });

    it('should return error for email without domain', () => {
      expect(validateEmail('user@')).toBe('Please enter a valid email address');
    });

    it('should return error for email without local part', () => {
      expect(validateEmail('@example.com')).toBe('Please enter a valid email address');
    });

    it('should return error for email without TLD', () => {
      expect(validateEmail('user@example')).toBe('Please enter a valid email address');
    });

    it('should return error for email with spaces', () => {
      expect(validateEmail('user name@example.com')).toBe('Please enter a valid email address');
    });

    it('should return error for email with multiple @', () => {
      expect(validateEmail('user@@example.com')).toBe('Please enter a valid email address');
    });

    it('should return error for just @ symbol', () => {
      expect(validateEmail('@')).toBe('Please enter a valid email address');
    });

    it('should return error for plain text', () => {
      expect(validateEmail('notanemail')).toBe('Please enter a valid email address');
    });
  });
});

describe('validateSingaporeMobile', () => {
  describe('Valid Singapore mobile numbers', () => {
    it('should return null for valid 8-digit number starting with 8', () => {
      expect(validateSingaporeMobile('81234567')).toBeNull();
    });

    it('should return null for valid 8-digit number starting with 9', () => {
      expect(validateSingaporeMobile('91234567')).toBeNull();
    });

    it('should return null for number with spaces', () => {
      expect(validateSingaporeMobile('9123 4567')).toBeNull();
    });

    it('should return null for number with +65 prefix', () => {
      expect(validateSingaporeMobile('+6591234567')).toBeNull();
    });

    it('should return null for number with +65 and spaces', () => {
      expect(validateSingaporeMobile('+65 9123 4567')).toBeNull();
    });

    it('should return null for empty string (optional field)', () => {
      expect(validateSingaporeMobile('')).toBeNull();
    });

    it('should return null for 8 starting with common prefixes', () => {
      expect(validateSingaporeMobile('80001234')).toBeNull();
      expect(validateSingaporeMobile('81234567')).toBeNull();
      expect(validateSingaporeMobile('82345678')).toBeNull();
      expect(validateSingaporeMobile('83456789')).toBeNull();
      expect(validateSingaporeMobile('84567890')).toBeNull();
      expect(validateSingaporeMobile('85678901')).toBeNull();
      expect(validateSingaporeMobile('86789012')).toBeNull();
      expect(validateSingaporeMobile('87890123')).toBeNull();
      expect(validateSingaporeMobile('88901234')).toBeNull();
      expect(validateSingaporeMobile('89012345')).toBeNull();
    });

    it('should return null for 9 starting with common prefixes', () => {
      expect(validateSingaporeMobile('90123456')).toBeNull();
      expect(validateSingaporeMobile('91234567')).toBeNull();
      expect(validateSingaporeMobile('92345678')).toBeNull();
      expect(validateSingaporeMobile('93456789')).toBeNull();
      expect(validateSingaporeMobile('94567890')).toBeNull();
      expect(validateSingaporeMobile('95678901')).toBeNull();
      expect(validateSingaporeMobile('96789012')).toBeNull();
      expect(validateSingaporeMobile('97890123')).toBeNull();
      expect(validateSingaporeMobile('98901234')).toBeNull();
      expect(validateSingaporeMobile('99012345')).toBeNull();
    });
  });

  describe('Invalid Singapore mobile numbers', () => {
    it('should return error for number starting with 6', () => {
      expect(validateSingaporeMobile('61234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for number starting with 7', () => {
      expect(validateSingaporeMobile('71234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for number starting with 0', () => {
      expect(validateSingaporeMobile('01234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for number starting with 1-5', () => {
      expect(validateSingaporeMobile('11234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
      expect(validateSingaporeMobile('21234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
      expect(validateSingaporeMobile('31234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
      expect(validateSingaporeMobile('41234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
      expect(validateSingaporeMobile('51234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for 7-digit number', () => {
      expect(validateSingaporeMobile('9123456')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for 9-digit number', () => {
      expect(validateSingaporeMobile('912345678')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for landline starting with 6', () => {
      expect(validateSingaporeMobile('65551234')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for number with letters', () => {
      expect(validateSingaporeMobile('9123abcd')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for number with special characters', () => {
      expect(validateSingaporeMobile('9123-4567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for number with parentheses', () => {
      expect(validateSingaporeMobile('(91) 234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for just the prefix +65', () => {
      expect(validateSingaporeMobile('+65')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for incomplete number with +65', () => {
      expect(validateSingaporeMobile('+65 912')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for all zeros', () => {
      expect(validateSingaporeMobile('00000000')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should return error for random text', () => {
      expect(validateSingaporeMobile('not a number')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple spaces', () => {
      expect(validateSingaporeMobile('9 1 2 3 4 5 6 7')).toBeNull();
    });

    it('should handle tabs and special whitespace', () => {
      expect(validateSingaporeMobile('9123\t4567')).toBeNull();
    });

    it('should handle +65 with no space', () => {
      expect(validateSingaporeMobile('+6591234567')).toBeNull();
    });

    it('should reject wrong country code', () => {
      expect(validateSingaporeMobile('+6091234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });

    it('should reject double +65 prefix', () => {
      expect(validateSingaporeMobile('+65+6591234567')).toBe('Mobile number must be 8 digits starting with 8 or 9');
    });
  });
});
