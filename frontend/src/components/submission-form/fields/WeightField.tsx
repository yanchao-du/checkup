import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { validateWeight } from '../../../lib/validationRules';

interface WeightFieldProps {
  value: string;
  onChange: (value: string) => void;
  lastRecordedWeight?: string;
  lastRecordedDate?: string;
}

export function WeightField({ value, onChange, lastRecordedWeight, lastRecordedDate }: WeightFieldProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 3) {
      onChange(val);
      if (error) setError(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setError(validateWeight(e.target.value));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="weight">Weight (kg)</Label>
      <Input
        id="weight"
        name="weight"
        type="text"
        inputMode="numeric"
        maxLength={3}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="70"
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {lastRecordedWeight && lastRecordedDate && (
        <p className="text-xs text-slate-500">
          Last recorded weight: {lastRecordedWeight} kg (Date: {new Date(lastRecordedDate).toLocaleDateString()})
        </p>
      )}
    </div>
  );
}
