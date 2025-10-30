import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { validateSystolic, validateDiastolic } from '../../../lib/validationRules';

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

  const handleSystolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 3) {
      onSystolicChange(val);
      if (systolicError) setSystolicError(null);
    }
  };

  const handleDiastolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 3) {
      onDiastolicChange(val);
      if (diastolicError) setDiastolicError(null);
    }
  };

  const handleSystolicBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setSystolicError(validateSystolic(e.target.value));
  };

  const handleDiastolicBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setDiastolicError(validateDiastolic(e.target.value));
  };

  return (
    <div className="space-y-2">
      <Label>Blood Pressure (mmHg)</Label>
      <div className="flex gap-2">
        <div className="flex-1">
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
            className={systolicError ? 'border-red-500' : ''}
          />
          <p className="text-xs text-slate-500">Systolic (high)</p>
          {systolicError && (
            <p className="text-xs text-red-600 mt-1">{systolicError}</p>
          )}
        </div>
        <div className="flex-1">
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
            className={diastolicError ? 'border-red-500' : ''}
          />
          <p className="text-xs text-slate-500">Diastolic (low)</p>
          {diastolicError && (
            <p className="text-xs text-red-600 mt-1">{diastolicError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
