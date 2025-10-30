import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { validateHeight } from '../../../lib/validationRules';

interface HeightFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function HeightField({ value, onChange }: HeightFieldProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 3) {
      onChange(val);
      if (error) setError(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setError(validateHeight(e.target.value));
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
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
