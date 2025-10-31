import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SixMonthlyMdwDetails } from '../SixMonthlyMdwDetails';

describe('SixMonthlyMdwDetails - Dynamic Test Requirements', () => {
  it('should display all 4 tests when all are required', () => {
    const formData = {
      hivTestRequired: 'true',
      chestXrayRequired: 'true',
      pregnancyTestPositive: 'false',
      syphilisTestPositive: 'false',
      hivTestPositive: 'false',
      chestXrayPositive: 'false',
      suspiciousInjuries: 'false',
      unintentionalWeightLoss: 'false',
    };

    render(<SixMonthlyMdwDetails formData={formData} />);

    expect(screen.getByText('Pregnancy Test')).toBeDefined();
    expect(screen.getByText('Syphilis Test')).toBeDefined();
    expect(screen.getByText('HIV Test')).toBeDefined();
    expect(screen.getByText('Chest X-Ray')).toBeDefined();
  });

  it('should display only pregnancy and syphilis when HIV and TB not required', () => {
    const formData = {
      hivTestRequired: 'false',
      chestXrayRequired: 'false',
      pregnancyTestPositive: 'false',
      syphilisTestPositive: 'false',
      suspiciousInjuries: 'false',
      unintentionalWeightLoss: 'false',
    };

    render(<SixMonthlyMdwDetails formData={formData} />);

    expect(screen.getByText('Pregnancy Test')).toBeDefined();
    expect(screen.getByText('Syphilis Test')).toBeDefined();
    expect(screen.queryByText('HIV Test')).toBeNull();
    expect(screen.queryByText('Chest X-Ray')).toBeNull();
  });

  it('should display HIV test when required even if result is negative', () => {
    const formData = {
      hivTestRequired: 'true',
      chestXrayRequired: 'false',
      pregnancyTestPositive: 'false',
      syphilisTestPositive: 'false',
      hivTestPositive: 'false',
      suspiciousInjuries: 'false',
      unintentionalWeightLoss: 'false',
    };

    render(<SixMonthlyMdwDetails formData={formData} />);

    expect(screen.getByText('HIV Test')).toBeDefined();
    expect(screen.getAllByText('Negative/Non-reactive').length).toBeGreaterThan(0);
    expect(screen.queryByText('Chest X-Ray')).toBeNull();
  });

  it('should display chest x-ray test when required even if result is negative', () => {
    const formData = {
      hivTestRequired: 'false',
      chestXrayRequired: 'true',
      pregnancyTestPositive: 'false',
      syphilisTestPositive: 'false',
      chestXrayPositive: 'false',
      suspiciousInjuries: 'false',
      unintentionalWeightLoss: 'false',
    };

    render(<SixMonthlyMdwDetails formData={formData} />);

    expect(screen.getByText('Chest X-Ray')).toBeDefined();
    expect(screen.queryByText('HIV Test')).toBeNull();
  });

  it('should display positive test results correctly', () => {
    const formData = {
      hivTestRequired: 'true',
      chestXrayRequired: 'true',
      pregnancyTestPositive: 'true',
      syphilisTestPositive: 'false',
      hivTestPositive: 'true',
      chestXrayPositive: 'false',
      suspiciousInjuries: 'false',
      unintentionalWeightLoss: 'false',
    };

    render(<SixMonthlyMdwDetails formData={formData} />);

    const positiveResults = screen.getAllByText('Positive/Reactive');
    expect(positiveResults).toHaveLength(2);
  });

  it('should handle missing hivTestRequired field (backward compatibility)', () => {
    const formData = {
      pregnancyTestPositive: 'false',
      syphilisTestPositive: 'false',
      suspiciousInjuries: 'false',
      unintentionalWeightLoss: 'false',
    };

    render(<SixMonthlyMdwDetails formData={formData} />);

    expect(screen.getByText('Pregnancy Test')).toBeDefined();
    expect(screen.getByText('Syphilis Test')).toBeDefined();
    expect(screen.queryByText('HIV Test')).toBeNull();
    expect(screen.queryByText('Chest X-Ray')).toBeNull();
  });

  it('should display physical examination details correctly', () => {
    const formData = {
      hivTestRequired: 'true',
      chestXrayRequired: 'true',
      pregnancyTestPositive: 'false',
      syphilisTestPositive: 'false',
      hivTestPositive: 'false',
      chestXrayPositive: 'false',
      suspiciousInjuries: 'true',
      unintentionalWeightLoss: 'true',
      policeReport: 'yes',
    };

    render(<SixMonthlyMdwDetails formData={formData} />);

    expect(screen.getByText('Signs of suspicious or unexplained injuries')).toBeDefined();
    expect(screen.getByText('Unintentional weight loss')).toBeDefined();
    expect(screen.getByText('Police report made')).toBeDefined();

    const yesTexts = screen.getAllByText('Yes');
    expect(yesTexts.length).toBeGreaterThanOrEqual(2);
  });
});
