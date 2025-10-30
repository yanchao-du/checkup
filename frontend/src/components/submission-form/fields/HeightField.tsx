import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { validateHeight } from '../../../lib/validationRules';

interface HeightFieldProps {
  value: string;
  onChange: (value: string) => void;
  lastRecordedHeight?: string;
  lastRecordedDate?: string;
  // Optional external error controlled by parent (inline validation)
  externalError?: string | null;
  setExternalError?: (err: string | null) => void;
}

export function HeightField({ value, onChange, lastRecordedHeight, lastRecordedDate, externalError, setExternalError }: HeightFieldProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 3) {
      onChange(val);
      // Clear either local or external error when user types
      if (error) setError(null);
      if (setExternalError) setExternalError(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const validation = validateHeight(e.target.value);
    if (setExternalError) {
      setExternalError(validation);
    } else {
      setError(validation);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="height">Height (cm)</Label>
      <Input
        id="height"
        name="height"
        type="text"
        inputMode="numeric"
        maxLength={3}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="170"
        className={`${error || externalError ? 'border-red-500' : ''}`}
      />
      {(externalError || error) && (
        <p className="text-xs text-red-600 mt-1">{externalError ?? error}</p>
      )}
      {lastRecordedHeight && lastRecordedDate && (
        <p className="text-xs text-slate-500">
          Last recorded height: {lastRecordedHeight} cm (Date: {new Date(lastRecordedDate).toLocaleDateString()})
        </p>
      )}
    </div>
  );
}
