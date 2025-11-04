import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { InlineError } from '../../ui/InlineError';
import { Checkbox } from '../../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { VisualAcuityField } from './VisualAcuityField';
import { AbnormalityChecklistField } from './AbnormalityChecklistField';
import { BloodPressureField } from './BloodPressureField';
import { validatePulse } from '../../../lib/validationRules';
import { useEffect, useState } from 'react';

interface CommonMedicalFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  hideHeightWeightBmi?: boolean;
  showAbnormalityChecklist?: boolean;
  onValidate?: (field: string, error: string) => void;
  isDriverExam?: boolean; // New prop to indicate if it's a driver exam
}

export function CommonMedicalFields({ 
  formData, 
  onChange, 
  errors = {}, 
  hideHeightWeightBmi = false, 
  showAbnormalityChecklist = false,
  onValidate,
  isDriverExam = false, // Default to false for backward compatibility
}: CommonMedicalFieldsProps) {
  const [bmi, setBmi] = useState<string>('');

  // Parse existing blood pressure format "120/80" into separate fields if needed
  useEffect(() => {
    if (formData.bloodPressure && !formData.systolic && !formData.diastolic) {
      const parts = formData.bloodPressure.split('/');
      if (parts.length === 2) {
        onChange('systolic', parts[0].trim());
        onChange('diastolic', parts[1].trim());
      }
    }
  }, []);

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

      {/* Cardiovascular Assessment Section */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Cardiovascular Assessment</h3>
        
        {/* Blood Pressure - Use separate fields for driver exams */}
        {isDriverExam ? (
          <BloodPressureField
            systolic={formData.systolic || ''}
            diastolic={formData.diastolic || ''}
            onSystolicChange={(value) => onChange('systolic', value)}
            onDiastolicChange={(value) => onChange('diastolic', value)}
          />
        ) : (
          <div>
            <Label htmlFor="bloodPressure">Blood Pressure (mmHg) <span className="text-red-500">*</span></Label>
            <Input
              id="bloodPressure"
              type="text"
              placeholder="e.g., 120/80"
              value={formData.bloodPressure || ''}
              onChange={(e) => onChange('bloodPressure', e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() && errors.bloodPressure) {
                  onValidate?.('bloodPressure', '');
                }
              }}
              className={errors.bloodPressure ? 'border-red-500' : ''}
            />
            {errors.bloodPressure && <InlineError>{errors.bloodPressure}</InlineError>}
            <p className="text-xs text-gray-500 mt-1">Format: systolic/diastolic (e.g., 120/80)</p>
          </div>
        )}

        {/* Pulse */}
        <div>
          <Label htmlFor="pulse">Pulse (bpm) <span className="text-red-500">*</span></Label>
          <Input
            id="pulse"
            type="text"
            inputMode="numeric"
            maxLength={3}
            placeholder="e.g., 72"
            value={formData.pulse || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (val.length <= 3) {
                onChange('pulse', val);
              }
            }}
            onBlur={(e) => {
              const error = validatePulse(e.target.value);
              if (error) {
                onValidate?.('pulse', error);
              } else if (errors.pulse) {
                onValidate?.('pulse', '');
              }
            }}
            className={errors.pulse ? 'border-red-500' : ''}
          />
          {errors.pulse && <InlineError>{errors.pulse}</InlineError>}
        </div>

        {/* S1_S2 Reading */}
        <div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="s1S2Reading">S1_S2 Reading</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="s1S2Reading"
                checked={formData.s1S2Reading === 'Abnormal'}
                onCheckedChange={(checked) => {
                  const value = checked ? 'Abnormal' : 'Normal';
                  onChange('s1S2Reading', value);
                  if (errors.s1S2Reading) {
                    onValidate?.('s1S2Reading', '');
                  }
                }}
                className={formData.s1S2Reading === 'Abnormal' ? 'data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 data-[state=checked]:text-white' : 'bg-white'}
              />
              <Label
                htmlFor="s1S2Reading"
                className={`text-sm font-medium cursor-pointer ${formData.s1S2Reading === 'Abnormal' ? 'text-red-600' : 'text-slate-600'}`}
              >
                Abnormal
              </Label>
            </div>
          </div>
          {errors.s1S2Reading && <InlineError>{errors.s1S2Reading}</InlineError>}
        </div>

        {/* Murmurs */}
        <div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="murmurs">Murmurs</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="murmurs"
                checked={formData.murmurs === 'Yes'}
                onCheckedChange={(checked) => {
                  const value = checked ? 'Yes' : 'No';
                  onChange('murmurs', value);
                  if (errors.murmurs) {
                    onValidate?.('murmurs', '');
                  }
                }}
                className={formData.murmurs === 'Yes' ? 'data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 data-[state=checked]:text-white' : 'bg-white'}
              />
              <Label
                htmlFor="murmurs"
                className={`text-sm font-medium cursor-pointer ${formData.murmurs === 'Yes' ? 'text-red-600' : 'text-slate-600'}`}
              >
                Yes
              </Label>
            </div>
          </div>
          {errors.murmurs && <InlineError>{errors.murmurs}</InlineError>}
        </div>
      </div>

      {/* Vision Assessment Section */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Vision Assessment</h3>
        
        {/* Optical Aids */}
        <div>
          <Label htmlFor="opticalAids">Does the patient use any optical aids (e.g., glasses or contact lenses)? <span className="text-red-500">*</span></Label>
          <RadioGroup
            value={formData.opticalAids || ''}
            onValueChange={(value: string) => {
              onChange('opticalAids', value);
              if (errors.opticalAids) {
                onValidate?.('opticalAids', '');
              }
            }}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="opticalAids-yes" />
              <Label htmlFor="opticalAids-yes" className="font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="opticalAids-no" />
              <Label htmlFor="opticalAids-no" className="font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
          {errors.opticalAids && <InlineError>{errors.opticalAids}</InlineError>}
        </div>

        {/* Visual Acuity */}
        <VisualAcuityField
          value={formData.visualAcuity || ''}
          onChange={(value) => onChange('visualAcuity', value)}
          error={errors.visualAcuity}
          onValidate={onValidate}
        />

        {/* Near Vision */}
        <div className="space-y-2">
          <Label>Near Vision <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Right Eye */}
            <div>
              <Label htmlFor="nearVision-re" className="text-sm font-normal">Right Eye (RE)</Label>
              <Select 
                value={formData.nearVisionRE || ''} 
                onValueChange={(value: string) => {
                  onChange('nearVisionRE', value);
                  if (value && errors.nearVisionRE) {
                    onValidate?.('nearVisionRE', '');
                  }
                }}
              >
                <SelectTrigger id="nearVision-re" className="mt-1 bg-white">
                  <SelectValue placeholder="Select RE value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N6">N6</SelectItem>
                  <SelectItem value="N8">N8</SelectItem>
                  <SelectItem value="N10">N10</SelectItem>
                  <SelectItem value="N12">N12</SelectItem>
                  <SelectItem value="N14">N14</SelectItem>
                  <SelectItem value="N18">N18</SelectItem>
                  <SelectItem value="N24">N24</SelectItem>
                  <SelectItem value="N36">N36</SelectItem>
                  <SelectItem value="N48">N48</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Left Eye */}
            <div>
              <Label htmlFor="nearVision-le" className="text-sm font-normal">Left Eye (LE)</Label>
              <Select 
                value={formData.nearVisionLE || ''} 
                onValueChange={(value: string) => {
                  onChange('nearVisionLE', value);
                  if (value && errors.nearVisionLE) {
                    onValidate?.('nearVisionLE', '');
                  }
                }}
              >
                <SelectTrigger id="nearVision-le" className="mt-1 bg-white">
                  <SelectValue placeholder="Select LE value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N6">N6</SelectItem>
                  <SelectItem value="N8">N8</SelectItem>
                  <SelectItem value="N10">N10</SelectItem>
                  <SelectItem value="N12">N12</SelectItem>
                  <SelectItem value="N14">N14</SelectItem>
                  <SelectItem value="N18">N18</SelectItem>
                  <SelectItem value="N24">N24</SelectItem>
                  <SelectItem value="N36">N36</SelectItem>
                  <SelectItem value="N48">N48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(errors.nearVisionRE || errors.nearVisionLE) && (
            <InlineError>{errors.nearVisionRE || errors.nearVisionLE}</InlineError>
          )}
        </div>
      </div>

      {/* Abnormality Checklist Section - Only for driver exams */}
      {showAbnormalityChecklist && (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Physical & Mental Health Assessment</h3>
          <AbnormalityChecklistField
            value={formData.abnormalityChecklist || {}}
            onChange={(value) => onChange('abnormalityChecklist', value)}
            errors={errors}
            onValidate={onValidate}
          />
        </div>
      )}

      {/* General Condition Assessment */}
      <div className="mt-6 pl-4">
        <Label htmlFor="passGeneralCondition" className="text-sm font-semibold text-gray-700">
          Does the patient pass the General Condition? <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.passGeneralCondition || ''}
          onValueChange={(value: string) => {
            onChange('passGeneralCondition', value);
            if (errors.passGeneralCondition) {
              onValidate?.('passGeneralCondition', '');
            }
          }}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="passGeneralCondition-yes" />
            <Label htmlFor="passGeneralCondition-yes" className="font-normal cursor-pointer">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="passGeneralCondition-no" />
            <Label htmlFor="passGeneralCondition-no" className="font-normal cursor-pointer">
              No
            </Label>
          </div>
        </RadioGroup>
        {errors.passGeneralCondition && <InlineError>{errors.passGeneralCondition}</InlineError>}
      </div>
    </div>
  );
}
