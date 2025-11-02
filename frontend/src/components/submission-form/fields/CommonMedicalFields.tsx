import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { InlineError } from '../../ui/InlineError';
import { VisualAcuityField } from './VisualAcuityField';
import { HearingTestField } from './HearingTestField';
import { AbnormalityChecklistField } from './AbnormalityChecklistField';
import { useEffect, useState } from 'react';

interface CommonMedicalFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  hideHeightWeightBmi?: boolean;
  showAbnormalityChecklist?: boolean;
  onValidate?: (field: string, error: string) => void;
}

export function CommonMedicalFields({ 
  formData, 
  onChange, 
  errors = {}, 
  hideHeightWeightBmi = false, 
  showAbnormalityChecklist = false,
  onValidate
}: CommonMedicalFieldsProps) {
  const [bmi, setBmi] = useState<string>('');

  // Auto-calculate BMI when height or weight changes
  useEffect(() => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const calculatedBmi = weight / (heightInMeters * heightInMeters);
      setBmi(calculatedBmi.toFixed(1));
    } else {
      setBmi('');
    }
  }, [formData.height, formData.weight]);

  return (
    <div className="space-y-4">
      {!hideHeightWeightBmi && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Height */}
          <div>
            <Label htmlFor="height">Height (cm) <span className="text-red-500">*</span></Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              placeholder="e.g., 170"
              value={formData.height || ''}
              onChange={(e) => onChange('height', e.target.value)}
              className={errors.height ? 'border-red-500' : ''}
            />
            {errors.height && <InlineError>{errors.height}</InlineError>}
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="weight">Weight (kg) <span className="text-red-500">*</span></Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="e.g., 70"
              value={formData.weight || ''}
              onChange={(e) => onChange('weight', e.target.value)}
              className={errors.weight ? 'border-red-500' : ''}
            />
            {errors.weight && <InlineError>{errors.weight}</InlineError>}
          </div>

          {/* BMI (read-only, auto-calculated) */}
          <div>
            <Label htmlFor="bmi">BMI</Label>
            <Input
              id="bmi"
              type="text"
              value={bmi}
              readOnly
              className="bg-gray-50"
              placeholder="Auto-calculated"
            />
            <p className="text-xs text-gray-500 mt-1">Calculated automatically</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blood Pressure */}
        <div>
          <Label htmlFor="bloodPressure">Blood Pressure (mmHg) <span className="text-red-500">*</span></Label>
          <Input
            id="bloodPressure"
            type="text"
            placeholder="e.g., 120/80"
            value={formData.bloodPressure || ''}
            onChange={(e) => onChange('bloodPressure', e.target.value)}
            className={errors.bloodPressure ? 'border-red-500' : ''}
          />
          {errors.bloodPressure && <InlineError>{errors.bloodPressure}</InlineError>}
          <p className="text-xs text-gray-500 mt-1">Format: systolic/diastolic (e.g., 120/80)</p>
        </div>

        {/* Pulse */}
        <div>
          <Label htmlFor="pulse">Pulse (bpm) <span className="text-red-500">*</span></Label>
          <Input
            id="pulse"
            type="number"
            placeholder="e.g., 72"
            value={formData.pulse || ''}
            onChange={(e) => onChange('pulse', e.target.value)}
            className={errors.pulse ? 'border-red-500' : ''}
          />
          {errors.pulse && <InlineError>{errors.pulse}</InlineError>}
        </div>
      </div>

      {/* Visual Acuity */}
      <VisualAcuityField
        value={formData.visualAcuity || ''}
        onChange={(value) => onChange('visualAcuity', value)}
      />

      {/* Hearing Test */}
      <HearingTestField
        value={formData.hearingTest || ''}
        onChange={(value) => onChange('hearingTest', value)}
      />

      {/* Abnormality Checklist - Only for driver exams */}
      {showAbnormalityChecklist && (
        <AbnormalityChecklistField
          value={formData.abnormalityChecklist || {}}
          onChange={(value) => onChange('abnormalityChecklist', value)}
          errors={errors}
          onValidate={onValidate}
        />
      )}
    </div>
  );
}
