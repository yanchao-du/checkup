import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { validateWeight } from '../../../lib/validationRules';
import { AlertTriangle } from 'lucide-react';

interface WeightFieldProps {
  value: string;
  onChange: (value: string) => void;
  lastRecordedWeight?: string;
  lastRecordedDate?: string;
  externalError?: string | null;
  setExternalError?: (err: string | null) => void;
  highlight?: boolean;
}

export function WeightField({ value, onChange, lastRecordedWeight, lastRecordedDate, externalError, setExternalError, highlight }: WeightFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 3) {
      onChange(val);
      if (error) setError(null);
      if (setExternalError) setExternalError(null);
      // Hide warning when user is typing
      setShowWarning(false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const validation = validateWeight(e.target.value);
    if (setExternalError) {
      setExternalError(validation);
    } else {
      setError(validation);
    }
    
    // Check and show warning on blur
    if (lastRecordedWeight && e.target.value) {
      const currentWeight = parseFloat(e.target.value);
      const lastWeight = parseFloat(lastRecordedWeight);
      if (!isNaN(currentWeight) && !isNaN(lastWeight)) {
        setShowWarning(currentWeight <= lastWeight * 0.9);
      }
    }
  };

  return (
  <div className={`space-y-2 ${highlight ? 'animate-pulse ring-2 ring-red-300 rounded-md' : ''}`}>
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
        className={`${externalError || error ? 'border-red-500' : ''}`}
      />
      {(externalError || error) && (
        <p className="text-xs text-red-600 mt-1">{externalError ?? error}</p>
      )}
      {showWarning && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            This helper has lost ≥10% weight since the last examination. If her weight loss was unintentional or if its reason cannot be determined, please select Yes for weight loss under the Physical examination details.
          </p>
        </div>
      )}
      {lastRecordedWeight && lastRecordedDate && (
        <p className="text-xs text-slate-500">
          Last recorded weight: {lastRecordedWeight} kg (Date: {new Date(lastRecordedDate).toLocaleDateString()})
        </p>
      )}
    </div>
  );
}
