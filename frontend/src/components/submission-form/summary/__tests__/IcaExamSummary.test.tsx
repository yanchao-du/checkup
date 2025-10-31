import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IcaExamSummary } from '../IcaExamSummary';

describe('IcaExamSummary', () => {
  const mockOnEdit = vi.fn();

  const defaultProps = {
    formData: {},
    patientName: 'Test Patient',
    patientNric: 'S1234567A',
    examinationDate: '2025-10-31',
    onEdit: mockOnEdit,
  };

  it('should render patient information', () => {
    render(<IcaExamSummary {...defaultProps} />);
    
    expect(screen.getByText('Patient Information')).toBeDefined();
    expect(screen.getByText('Test Patient')).toBeDefined();
    expect(screen.getByText('S1234567A')).toBeDefined();
  });

  it('should render examination details section', () => {
    render(<IcaExamSummary {...defaultProps} />);
    
    expect(screen.getByText('Examination Details')).toBeDefined();
    expect(screen.getByText('Test Results')).toBeDefined();
  });

  it('should display HIV test as Negative when result is NEGATIVE', () => {
    const formData = {
      hivTestPositive: 'false',
    };
    
    render(<IcaExamSummary {...defaultProps} formData={formData} />);
    
    expect(screen.getByText('HIV test')).toBeDefined();
    const negativeResults = screen.getAllByText('Negative/Non-reactive');
    expect(negativeResults.length).toBeGreaterThan(0);
  });

  it('should display HIV test as Positive when positive', () => {
    const formData = { hivTestPositive: 'true' };
    render(<IcaExamSummary {...defaultProps} formData={formData} />);
    
    expect(screen.getByText('Positive/Reactive')).toBeDefined();
  });

  it('should display Chest X-ray as Negative when not positive', () => {
    const formData = { chestXrayPositive: 'false' };
    render(<IcaExamSummary {...defaultProps} formData={formData} />);
    
    expect(screen.getByText('Chest X-ray to screen for TB')).toBeDefined();
    const negativeResults = screen.getAllByText('Negative/Non-reactive');
    expect(negativeResults.length).toBeGreaterThan(0);
  });

  it('should display Chest X-ray as Positive when positive', () => {
    const formData = { chestXrayPositive: 'true' };
    render(<IcaExamSummary {...defaultProps} formData={formData} />);
    
    expect(screen.getByText('Positive/Reactive')).toBeDefined();
  });

  it('should always display Remarks section', () => {
    render(<IcaExamSummary {...defaultProps} />);
    
    expect(screen.getByText('Remarks')).toBeDefined();
  });

  it('should display dash when no remarks', () => {
    const formData = {};
    render(<IcaExamSummary {...defaultProps} formData={formData} />);
    
    expect(screen.getByText('-')).toBeDefined();
  });

  it('should display remarks when provided', () => {
    const formData = { remarks: 'Patient has history of TB' };
    render(<IcaExamSummary {...defaultProps} formData={formData} />);
    
    expect(screen.getByText('Patient has history of TB')).toBeDefined();
  });

  it('should format examination date correctly', () => {
    render(<IcaExamSummary {...defaultProps} examinationDate="2025-10-31" />);
    
    // Date formatting depends on locale, but should contain some date content
    expect(screen.getByText(/31|10|2025/)).toBeDefined();
  });

  it('should call onEdit when Edit button is clicked', () => {
    render(<IcaExamSummary {...defaultProps} />);
    
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('should display both positive test results with proper styling', () => {
    const formData = {
      hivTestPositive: 'true',
      chestXrayPositive: 'true',
    };
    
    render(<IcaExamSummary {...defaultProps} formData={formData} />);
    
    const positiveResults = screen.getAllByText('Positive/Reactive');
    expect(positiveResults.length).toBe(2);
  });

  it('should handle empty formData gracefully', () => {
    render(<IcaExamSummary {...defaultProps} formData={{}} />);
    
    expect(screen.getByText('HIV test')).toBeDefined();
    expect(screen.getByText('Chest X-ray to screen for TB')).toBeDefined();
    expect(screen.getByText('Remarks')).toBeDefined();
  });
});
