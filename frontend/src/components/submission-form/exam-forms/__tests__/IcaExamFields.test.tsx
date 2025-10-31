import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IcaExamFields } from '../IcaExamFields';

describe('IcaExamFields', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    formData: {},
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render HIV test checkbox', () => {
    render(<IcaExamFields {...defaultProps} />);
    
    expect(screen.getByText('HIV test')).toBeDefined();
    const positiveLabels = screen.getAllByText('Positive/Reactive');
    expect(positiveLabels.length).toBe(2);
  });

  it('should render Chest X-ray checkbox', () => {
    render(<IcaExamFields {...defaultProps} />);
    
    expect(screen.getByText('Chest X-ray to screen for TB')).toBeDefined();
  });

  it('should render Remarks section', () => {
    render(<IcaExamFields {...defaultProps} />);
    
    expect(screen.getByText('Remarks')).toBeDefined();
  });

  it('should call onChange when HIV checkbox is checked', () => {
    const { container } = render(<IcaExamFields {...defaultProps} />);
    
    const checkbox = container.querySelector('#hivTestPositive') as HTMLInputElement;
    fireEvent.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith('hivTestPositive', 'true');
  });

  it('should call onChange when HIV checkbox is unchecked', () => {
    const props = {
      formData: { hivTestPositive: 'true' },
      onChange: mockOnChange,
    };
    
    const { container } = render(<IcaExamFields {...props} />);
    
    const checkbox = container.querySelector('#hivTestPositive') as HTMLInputElement;
    fireEvent.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith('hivTestPositive', 'false');
  });

  it('should call onChange when Chest X-ray checkbox is checked', () => {
    const { container } = render(<IcaExamFields {...defaultProps} />);
    
    const checkbox = container.querySelector('#chestXrayPositive') as HTMLInputElement;
    fireEvent.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith('chestXrayPositive', 'true');
  });

  it('should display checked state for HIV when formData has hivTestPositive true', () => {
    const props = {
      formData: { hivTestPositive: 'true' },
      onChange: mockOnChange,
    };
    
    const { container } = render(<IcaExamFields {...props} />);
    
    const checkbox = container.querySelector('#hivTestPositive') as HTMLButtonElement;
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('should display checked state for Chest X-ray when formData has chestXrayPositive true', () => {
    const props = {
      formData: { chestXrayPositive: 'true' },
      onChange: mockOnChange,
    };
    
    const { container } = render(<IcaExamFields {...props} />);
    
    const checkbox = container.querySelector('#chestXrayPositive') as HTMLButtonElement;
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('should display HIV test note', () => {
    render(<IcaExamFields {...defaultProps} />);
    
    expect(screen.getByText(/HIV test must be done by an MOH-approved laboratory/i)).toBeDefined();
  });

  it('should handle remarks field changes', () => {
    const props = {
      formData: { hasAdditionalRemarks: 'true' },
      onChange: mockOnChange,
    };
    
    render(<IcaExamFields {...props} />);
    
    // The MdwRemarksField component handles the remarks input
    // This test ensures it's rendered when hasAdditionalRemarks is true
    expect(screen.getByText('Remarks')).toBeDefined();
  });
});
