import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { InlineError } from '../../ui/InlineError';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { VisualAcuityField } from './VisualAcuityField';
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

      {/* Cardiovascular Assessment Section */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Cardiovascular Assessment</h3>
        
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

        {/* S1_S2 Reading */}
        <div>
          <Label htmlFor="s1S2Reading">S1_S2 Reading <span className="text-red-500">*</span></Label>
          <Input
            id="s1S2Reading"
            type="text"
            placeholder="Enter S1_S2 reading"
            value={formData.s1S2Reading || ''}
            onChange={(e) => onChange('s1S2Reading', e.target.value)}
            className={errors.s1S2Reading ? 'border-red-500' : ''}
          />
          {errors.s1S2Reading && <InlineError>{errors.s1S2Reading}</InlineError>}
        </div>

        {/* Murmurs */}
        <div>
          <Label htmlFor="murmurs">Murmurs <span className="text-red-500">*</span></Label>
          <Input
            id="murmurs"
            type="text"
            placeholder="Enter murmurs reading"
            value={formData.murmurs || ''}
            onChange={(e) => onChange('murmurs', e.target.value)}
            className={errors.murmurs ? 'border-red-500' : ''}
          />
          {errors.murmurs && <InlineError>{errors.murmurs}</InlineError>}
        </div>
      </div>

      {/* Vision Assessment Section */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Vision Assessment</h3>
        
        {/* Optical Aids */}
        <div>
          <Label htmlFor="opticalAids">Does the patient use any optical aids (e.g., glasses or contact lenses)? <span className="text-red-500">*</span></Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center space-x-2 text-sm font-normal">
              <input
                type="radio"
                name="opticalAids"
                value="yes"
                checked={formData.opticalAids === 'yes'}
                onChange={(e) => onChange('opticalAids', e.target.value)}
                className="h-4 w-4"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-normal">
              <input
                type="radio"
                name="opticalAids"
                value="no"
                checked={formData.opticalAids === 'no'}
                onChange={(e) => onChange('opticalAids', e.target.value)}
                className="h-4 w-4"
              />
              <span>No</span>
            </label>
          </div>
          {errors.opticalAids && <InlineError>{errors.opticalAids}</InlineError>}
        </div>

        {/* Visual Acuity */}
        <VisualAcuityField
          value={formData.visualAcuity || ''}
          onChange={(value) => onChange('visualAcuity', value)}
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
                onValueChange={(value: string) => onChange('nearVisionRE', value)}
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
                onValueChange={(value: string) => onChange('nearVisionLE', value)}
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
          <h3 className="text-sm font-semibold text-gray-700">Physical Abnormalities</h3>
          <AbnormalityChecklistField
            value={formData.abnormalityChecklist || {}}
            onChange={(value) => onChange('abnormalityChecklist', value)}
            errors={errors}
            onValidate={onValidate}
          />
        </div>
      )}
    </div>
  );
}
