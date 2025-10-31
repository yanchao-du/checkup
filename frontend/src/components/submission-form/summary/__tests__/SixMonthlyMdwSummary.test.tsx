import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SixMonthlyMdwSummary } from '../SixMonthlyMdwSummary';

describe('SixMonthlyMdwSummary - Dynamic Test Requirements', () => {
  const mockOnEdit = vi.fn();

  const defaultProps = {
    formData: {},
    patientName: 'Test Patient',
    patientNric: 'S1234567A',
    examinationDate: '2025-10-31',
    onEdit: mockOnEdit,
  };

  it('should display all 4 tests when all tests required via prop', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: true,
      chestXray: true,
    };

    render(
      <SixMonthlyMdwSummary
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    expect(screen.getByText('Pregnancy test')).toBeDefined();
    expect(screen.getByText('Syphilis test')).toBeDefined();
    expect(screen.getByText('HIV test')).toBeDefined();
    expect(screen.getByText('Chest X-ray to screen for TB')).toBeDefined();
  });

  it('should display only pregnancy and syphilis when HIV and TB not required via prop', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: false,
      chestXray: false,
    };

    render(
      <SixMonthlyMdwSummary
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    expect(screen.getByText('Pregnancy test')).toBeDefined();
    expect(screen.getByText('Syphilis test')).toBeDefined();
    expect(screen.queryByText('HIV test')).toBeNull();
    expect(screen.queryByText('Chest X-ray to screen for TB')).toBeNull();
  });

  it('should extract test requirements from formData when requiredTests prop not provided', () => {
    const formData = {
      hivTestRequired: 'true',
      chestXrayRequired: 'true',
    };

    render(
      <SixMonthlyMdwSummary
        {...defaultProps}
        formData={formData}
      />
    );

    expect(screen.getByText('Pregnancy test')).toBeDefined();
    expect(screen.getByText('Syphilis test')).toBeDefined();
    expect(screen.getByText('HIV test')).toBeDefined();
    expect(screen.getByText('Chest X-ray to screen for TB')).toBeDefined();
  });

  it('should extract test requirements from formData when only HIV required', () => {
    const formData = {
      hivTestRequired: 'true',
      chestXrayRequired: 'false',
    };

    render(
      <SixMonthlyMdwSummary
        {...defaultProps}
        formData={formData}
      />
    );

    expect(screen.getByText('HIV test')).toBeDefined();
    expect(screen.queryByText('Chest X-ray to screen for TB')).toBeNull();
  });

  it('should default to pregnancy and syphilis only when formData has no test requirement flags', () => {
    const formData = {};

    render(
      <SixMonthlyMdwSummary
        {...defaultProps}
        formData={formData}
      />
    );

    expect(screen.getByText('Pregnancy test')).toBeDefined();
    expect(screen.getByText('Syphilis test')).toBeDefined();
    expect(screen.queryByText('HIV test')).toBeNull();
    expect(screen.queryByText('Chest X-ray to screen for TB')).toBeNull();
  });

  it('should display patient information section', () => {
    render(<SixMonthlyMdwSummary {...defaultProps} />);

    expect(screen.getByText('Patient Information')).toBeDefined();
    expect(screen.getByText('Test Patient')).toBeDefined();
    expect(screen.getByText('S1234567A')).toBeDefined();
  });

  it('should display test results with negative values by default', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: true,
      chestXray: true,
    };

    render(
      <SixMonthlyMdwSummary
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    const negativeResults = screen.getAllByText('Negative/Non-reactive');
    expect(negativeResults.length).toBeGreaterThanOrEqual(4);
  });

  it('should display positive test results correctly', () => {
    const formData = {
      hivTestRequired: 'true',
      chestXrayRequired: 'true',
      pregnancyTestPositive: 'true',
      hivTestPositive: 'true',
    };

    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: true,
      chestXray: true,
    };

    render(
      <SixMonthlyMdwSummary
        {...defaultProps}
        formData={formData}
        requiredTests={requiredTests}
      />
    );

    const positiveResults = screen.getAllByText('Positive/Reactive');
    expect(positiveResults).toHaveLength(2);
  });
});
