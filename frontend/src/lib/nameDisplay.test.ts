import { describe, it, expect } from 'vitest';
import { getDisplayName } from './nameDisplay';

describe('getDisplayName', () => {
  const fullName = 'Mariange Thok';
  const maskedName = 'Mari**** Th**';

  describe('MDW exam type', () => {
    it('should mask name when status is draft', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_MDW', 'draft')).toBe(maskedName);
    });

    it('should mask name when status is pending_approval', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_MDW', 'pending_approval')).toBe(maskedName);
    });

    it('should mask name when status is rejected', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_MDW', 'rejected')).toBe(maskedName);
    });

    it('should mask name when status is revision_requested', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_MDW', 'revision_requested')).toBe(maskedName);
    });

    it('should show full name when status is submitted', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_MDW', 'submitted')).toBe(fullName);
    });

    it('should mask name when no status provided', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_MDW')).toBe(maskedName);
    });
  });

  describe('FMW exam type', () => {
    it('should mask name when status is draft', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_FMW', 'draft')).toBe(maskedName);
    });

    it('should mask name when status is pending_approval', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_FMW', 'pending_approval')).toBe(maskedName);
    });

    it('should show full name when status is submitted', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_FMW', 'submitted')).toBe(fullName);
    });

    it('should mask name when no status provided', () => {
      expect(getDisplayName(fullName, 'SIX_MONTHLY_FMW')).toBe(maskedName);
    });
  });

  describe('Other exam types', () => {
    const otherExamTypes = [
      'WORK_PERMIT',
      'AGED_DRIVERS',
      'PR_MEDICAL',
      'STUDENT_PASS_MEDICAL',
      'LTVP_MEDICAL',
      'DRIVING_LICENCE_TP',
      'DRIVING_VOCATIONAL_TP_LTA',
      'VOCATIONAL_LICENCE_LTA',
    ];

    otherExamTypes.forEach(examType => {
      it(`should NOT mask name for ${examType} regardless of status`, () => {
        expect(getDisplayName(fullName, examType, 'draft')).toBe(fullName);
        expect(getDisplayName(fullName, examType, 'pending_approval')).toBe(fullName);
        expect(getDisplayName(fullName, examType, 'submitted')).toBe(fullName);
        expect(getDisplayName(fullName, examType, 'rejected')).toBe(fullName);
        expect(getDisplayName(fullName, examType)).toBe(fullName);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty name', () => {
      expect(getDisplayName('', 'SIX_MONTHLY_MDW', 'draft')).toBe('');
    });

    it('should handle single character name', () => {
      expect(getDisplayName('A', 'SIX_MONTHLY_MDW', 'draft')).toBe('A');
    });

    it('should handle short names', () => {
      expect(getDisplayName('Jo', 'SIX_MONTHLY_MDW', 'draft')).toBe('J*');
    });
  });
});
