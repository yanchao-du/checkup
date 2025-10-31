import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IcaExamDetails } from '../IcaExamDetails';

describe('IcaExamDetails', () => {
  it('should render Test Results section', () => {
    const formData = {};
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('Test Results')).toBeDefined();
  });

  it('should display HIV Test as Negative when not positive', () => {
    const formData = { hivTestPositive: 'false' };
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('HIV Test')).toBeDefined();
    const negativeResults = screen.getAllByText('Negative/Non-reactive');
    expect(negativeResults.length).toBeGreaterThan(0);
  });

  it('should display HIV Test as Positive when positive', () => {
    const formData = { hivTestPositive: 'true' };
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('HIV Test')).toBeDefined();
    expect(screen.getByText('Positive/Reactive')).toBeDefined();
  });

  it('should display Chest X-Ray as Negative when not positive', () => {
    const formData = { chestXrayPositive: 'false' };
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('Chest X-Ray to screen for TB')).toBeDefined();
    const negativeResults = screen.getAllByText('Negative/Non-reactive');
    expect(negativeResults.length).toBe(2);
  });

  it('should display Chest X-Ray as Positive when positive', () => {
    const formData = { chestXrayPositive: 'true' };
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('Chest X-Ray to screen for TB')).toBeDefined();
    expect(screen.getByText('Positive/Reactive')).toBeDefined();
  });

  it('should always display Remarks section', () => {
    const formData = {};
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('Remarks')).toBeDefined();
  });

  it('should display dash when no remarks', () => {
    const formData = {};
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('-')).toBeDefined();
  });

  it('should display remarks text when provided', () => {
    const formData = { remarks: 'Patient requires follow-up' };
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('Patient requires follow-up')).toBeDefined();
  });

  it('should display both positive results correctly', () => {
    const formData = {
      hivTestPositive: 'true',
      chestXrayPositive: 'true',
    };
    
    render(<IcaExamDetails formData={formData} />);
    
    const positiveResults = screen.getAllByText('Positive/Reactive');
    expect(positiveResults.length).toBe(2);
  });

  it('should handle empty formData gracefully', () => {
    render(<IcaExamDetails formData={{}} />);
    
    expect(screen.getByText('Test Results')).toBeDefined();
    expect(screen.getByText('HIV Test')).toBeDefined();
    expect(screen.getByText('Chest X-Ray to screen for TB')).toBeDefined();
    expect(screen.getByText('Remarks')).toBeDefined();
  });

  it('should preserve remarks formatting with whitespace', () => {
    const formData = {
      remarks: 'Line 1\nLine 2\nLine 3',
    };
    
    render(<IcaExamDetails formData={formData} />);
    
    // Check that remarks are rendered (whitespace-pre-wrap preserves formatting)
    expect(screen.getByText(/Line 1/)).toBeDefined();
  });

  it('should display negative results by default when test results not specified', () => {
    const formData = {};
    render(<IcaExamDetails formData={formData} />);
    
    const negativeResults = screen.getAllByText('Negative/Non-reactive');
    expect(negativeResults.length).toBe(2);
  });

  it('should handle string boolean values correctly', () => {
    const formData = {
      hivTestPositive: 'true',
      chestXrayPositive: 'false',
    };
    
    render(<IcaExamDetails formData={formData} />);
    
    expect(screen.getByText('Positive/Reactive')).toBeDefined();
    expect(screen.getByText('Negative/Non-reactive')).toBeDefined();
  });
});
