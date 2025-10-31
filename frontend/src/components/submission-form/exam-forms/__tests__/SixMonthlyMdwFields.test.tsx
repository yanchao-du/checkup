import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SixMonthlyMdwFields } from '../SixMonthlyMdwFields';

describe('SixMonthlyMdwFields - Dynamic Test Requirements', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    formData: {},
    onChange: mockOnChange,
  };

  it('should display all 4 test checkboxes when all tests required', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: true,
      chestXray: true,
    };

    render(
      <SixMonthlyMdwFields
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    expect(screen.getByText('Pregnancy test')).toBeDefined();
    expect(screen.getByText('Syphilis test')).toBeDefined();
    expect(screen.getByText('HIV test')).toBeDefined();
    expect(screen.getByText('Chest X-ray to screen for TB')).toBeDefined();
  });

  it('should display only pregnancy and syphilis when HIV and TB not required', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: false,
      chestXray: false,
    };

    render(
      <SixMonthlyMdwFields
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    expect(screen.getByText('Pregnancy test')).toBeDefined();
    expect(screen.getByText('Syphilis test')).toBeDefined();
    expect(screen.queryByText('HIV test')).toBeNull();
    expect(screen.queryByText('Chest X-ray to screen for TB')).toBeNull();
  });

  it('should display HIV test checkbox when HIV required', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: true,
      chestXray: false,
    };

    render(
      <SixMonthlyMdwFields
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    expect(screen.getByText('HIV test')).toBeDefined();
    expect(screen.queryByText('Chest X-ray to screen for TB')).toBeNull();
  });

  it('should display chest x-ray checkbox when TB screening required', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: false,
      chestXray: true,
    };

    render(
      <SixMonthlyMdwFields
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    expect(screen.getByText('Chest X-ray to screen for TB')).toBeDefined();
    expect(screen.queryByText('HIV test')).toBeNull();
  });

  it('should use default all tests required when requiredTests prop not provided', () => {
    render(<SixMonthlyMdwFields {...defaultProps} />);

    // Should show all 4 tests by default
    expect(screen.getByText('Pregnancy test')).toBeDefined();
    expect(screen.getByText('Syphilis test')).toBeDefined();
    expect(screen.getByText('HIV test')).toBeDefined();
    expect(screen.getByText('Chest X-ray to screen for TB')).toBeDefined();
  });

  it('should always display body measurements section', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: false,
      chestXray: false,
    };

    render(
      <SixMonthlyMdwFields
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    expect(screen.getByText('Body Measurements')).toBeDefined();
    expect(screen.getByText(/Height/)).toBeDefined();
    expect(screen.getByText(/Weight/)).toBeDefined();
  });

  it('should always display physical examination section', () => {
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: false,
      chestXray: false,
    };

    render(
      <SixMonthlyMdwFields
        {...defaultProps}
        requiredTests={requiredTests}
      />
    );

    expect(screen.getByText('Physical Examination Details')).toBeDefined();
    expect(screen.getByText(/Signs of suspicious or unexplained injuries/)).toBeDefined();
    expect(screen.getByText(/Unintentional weight loss/)).toBeDefined();
  });
});
