import { useState, useEffect } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { InlineError } from '../../ui/InlineError';
import { validateSystolic, validateDiastolic, validateBloodPressure } from '../../../lib/validationRules';

interface BloodPressureFieldProps {
  systolic: string;
  diastolic: string;
  onSystolicChange: (value: string) => void;
  onDiastolicChange: (value: string) => void;
}

export function BloodPressureField({
  systolic,
  diastolic,
  onSystolicChange,
  onDiastolicChange,
}: BloodPressureFieldProps) {
  const [systolicError, setSystolicError] = useState<string | null>(null);
  const [diastolicError, setDiastolicError] = useState<string | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const handleSystolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 3) {
      onSystolicChange(val);
      if (systolicError) setSystolicError(null);
      if (comparisonError) setComparisonError(null);
    }
  };

  const handleDiastolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 3) {
      onDiastolicChange(val);
      if (diastolicError) setDiastolicError(null);
      if (comparisonError) setComparisonError(null);
    }
  };

  const handleSystolicBlur = () => {
    const error = validateSystolic(systolic);
    setSystolicError(error);
    
    // If both values are present, validate the comparison
    if (!error && systolic && diastolic) {
      const bpError = validateBloodPressure(systolic, diastolic);
      setComparisonError(bpError);
    }
  };

  const handleDiastolicBlur = () => {
    const error = validateDiastolic(diastolic);
    setDiastolicError(error);
    
    // If both values are present, validate the comparison
    if (!error && systolic && diastolic) {
      const bpError = validateBloodPressure(systolic, diastolic);
      setComparisonError(bpError);
    }
  };

  // Clear comparison error when either field changes
  useEffect(() => {
    if (comparisonError && systolic && diastolic) {
      const bpError = validateBloodPressure(systolic, diastolic);
      setComparisonError(bpError);
    }
  }, [systolic, diastolic]);

  return (
    <div className="space-y-2">
      <Label>Blood Pressure (mmHg) <span className="text-red-500">*</span></Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Input
            id="systolic"
            name="systolic"
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={systolic}
            onChange={handleSystolicChange}
            onBlur={handleSystolicBlur}
            placeholder="120"
            className={systolicError || comparisonError ? 'border-red-500' : ''}
          />
          <p className="text-xs text-slate-500">Systolic (high)</p>
          {systolicError && <InlineError>{systolicError}</InlineError>}
        </div>
        <div className="space-y-1">
          <Input
            id="diastolic"
            name="diastolic"
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={diastolic}
            onChange={handleDiastolicChange}
            onBlur={handleDiastolicBlur}
            placeholder="80"
            className={diastolicError || comparisonError ? 'border-red-500' : ''}
          />
          <p className="text-xs text-slate-500">Diastolic (low)</p>
          {diastolicError && <InlineError>{diastolicError}</InlineError>}
        </div>
      </div>
      {comparisonError && !systolicError && !diastolicError && (
        <InlineError>{comparisonError}</InlineError>
      )}
    </div>
  );
}
