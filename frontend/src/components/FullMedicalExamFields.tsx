import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PatientCertificationCheckbox } from './submission-form/fields/PatientCertificationCheckbox';
import { CheckboxField } from './submission-form/fields/CheckboxField';

interface FullMedicalExamFieldsProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  gender?: string;
  section?: 'medical-history' | 'medical-examination' | 'all';
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
}

export function FullMedicalExamFields({
  formData,
  handleInputChange,
  gender,
  section = 'all',
  errors,
  onValidate,
}: FullMedicalExamFieldsProps) {
  const isFemale = gender === 'F';

  // Medical History conditions
  const medicalHistoryConditions = [
    { key: 'cardiovascular', label: 'Cardiovascular disease (e.g. ischemic heart disease)' },
    { key: 'gastrointestinal', label: 'Gastrointestinal disease (e.g. peptic ulcer disease)' },
    { key: 'lifestyleRiskFactors', label: 'Other lifestyle risk factors or significant family history' },
    { key: 'longTermMedications', label: 'Long-term medications' },
    { key: 'mentalHealth', label: 'Mental health condition (e.g. depression)' },
    { key: 'metabolic', label: 'Metabolic disease (diabetes, hypertension)' },
    { key: 'neurological', label: 'Neurological disease (e.g. epilepsy, stroke)' },
    { key: 'previousInfections', label: 'Previous infections of concern (e.g. COVID-19)' },
    { key: 'previousSurgeries', label: 'Previous surgeries' },
    { key: 'respiratory', label: 'Respiratory disease (e.g. tuberculosis, asthma)' },
    { key: 'smokingHistory', label: 'Smoking History (tobacco)' },
    { key: 'otherMedical', label: 'Other medical condition' },
  ];

  // Medical Examination tests
  const medicalTests = [
    { key: 'hiv', label: 'HIV', checkboxLabel: 'Positive' },
    { key: 'pregnancy', label: 'Pregnancy', femaleOnly: true, checkboxLabel: 'Positive' },
    { key: 'urineAlbumin', label: 'Urine Albumin', checkboxLabel: 'Abnormal' },
    { key: 'urineSugar', label: 'Urine Sugar', checkboxLabel: 'Abnormal' },
    { key: 'bloodPressure', label: 'Blood Pressure', checkboxLabel: 'Abnormal' },
    { key: 'malaria', label: 'Malaria', checkboxLabel: 'Positive' },
    { key: 'colourVision', label: 'Colour Vision', checkboxLabel: 'Abnormal' },
  ];

  const handleCheckboxChange = (field: string, checked: boolean) => {
    handleInputChange({
      target: {
        name: field,
        value: checked ? 'yes' : '',
      },
    } as any);
    
    // Clear remarks when unchecking
    if (!checked) {
      handleInputChange({
        target: {
          name: `${field}Remarks`,
          value: '',
        },
      } as any);
    }
    
    // Clear pregnancy test error when checking the box
    if (field === 'test_pregnancy' && checked && onValidate) {
      onValidate('pregnancyTest', '');
    }
  };

  const handleRemarksChange = (field: string, value: string) => {
    handleInputChange({
      target: {
        name: `${field}Remarks`,
        value: value,
      },
    } as any);
    
    // Clear error when user starts typing
    if (onValidate && value.trim()) {
      onValidate(`${field}Remarks`, '');
    }
  };

  const handleRemarksBlur = (field: string) => {
    if (onValidate && formData[field] === 'yes' && !formData[`${field}Remarks`]?.trim()) {
      onValidate(`${field}Remarks`, 'Remarks are required when this condition is selected');
    }
  };

  const handleClearAll = () => {
    // Clear all medical history checkboxes and their remarks
    medicalHistoryConditions.forEach((condition) => {
      handleInputChange({
        target: {
          name: `medicalHistory_${condition.key}`,
          value: '',
        },
      } as any);
      handleInputChange({
        target: {
          name: `medicalHistory_${condition.key}Remarks`,
          value: '',
        },
      } as any);
    });
  };

  const handleRadioChange = (field: string, value: string) => {
    handleInputChange({
      target: {
        name: field,
        value: value,
      },
    } as any);
  };

  return (
    <>
      {/* Medical History - Direct display without accordion */}
      {(section === 'all' || section === 'medical-history') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Does the patient have a history of, or is currently suffering from, any of the following?
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleClearAll} className="border-blue-500 text-blue-500 hover:bg-blue-50">
              Clear All
            </Button>
          </div>
          <ul className="space-y-3">
            {medicalHistoryConditions.map((condition) => (
              <li key={condition.key}>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`medicalHistory_${condition.key}`}
                    name={`medicalHistory_${condition.key}`}
                    checked={formData[`medicalHistory_${condition.key}`] === 'yes'}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(`medicalHistory_${condition.key}`, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <Label
                    htmlFor={`medicalHistory_${condition.key}`}
                    className={`font-normal cursor-pointer ${formData[`medicalHistory_${condition.key}`] === 'yes' ? 'font-semibold' : ''}`}
                  >
                    {condition.label}
                  </Label>
                </div>
                {formData[`medicalHistory_${condition.key}`] === 'yes' && (
                  <div className="mt-2 ml-8 p-4 border-l-2 border-blue-200 bg-blue-50/30 space-y-2">
                    <Label htmlFor={`medicalHistory_${condition.key}_remarks`} className="text-sm font-semibold">
                      Remarks <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id={`medicalHistory_${condition.key}_remarks`}
                      name={`medicalHistory_${condition.key}Remarks`}
                      placeholder="Please provide details..."
                      value={formData[`medicalHistory_${condition.key}Remarks`] || ''}
                      onChange={(e) => handleRemarksChange(`medicalHistory_${condition.key}`, e.target.value)}
                      onBlur={() => handleRemarksBlur(`medicalHistory_${condition.key}`)}
                      className="mt-1"
                      rows={3}
                    />
                    {errors?.[`medicalHistory_${condition.key}Remarks`] && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors[`medicalHistory_${condition.key}Remarks`]}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          {/* Patient Certification */}
          <PatientCertificationCheckbox
            id="medicalHistoryPatientCertification"
            checked={formData.medicalHistory_patientCertification || false}
            onChange={(checked) => handleInputChange({
              target: {
                name: 'medicalHistory_patientCertification',
                value: checked,
              },
            } as any)}
          />
        </div>
      )}

      {/* Medical Examination - Direct display without accordion */}
      {(section === 'all' || section === 'medical-examination') && (
        <div className="space-y-6">
        
        {/* Chest X-ray */}
        <div className="space-y-2">
          <div className="border border-slate-200 rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-4 md:items-start">
              <Label className="text-sm font-normal text-slate-700 md:pt-0.5">Chest X-ray <span className="text-red-500">*</span></Label>
              <RadioGroup
                value={formData.chestXray || ''}
                onValueChange={(value: string) => {
                  handleRadioChange('chestXray', value);
                  if (onValidate) {
                    onValidate('chestXray', '');
                    // Clear pregnancy test error if changing away from pregnancy-exempted
                    if (value !== 'pregnancy-exempted') {
                      onValidate('pregnancyTest', '');
                    }
                  }
                }}
                className="space-y-1.5"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="xray-normal" />
                  <Label htmlFor="xray-normal" className="font-normal cursor-pointer">
                    Normal
                  </Label>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no-referral" id="xray-no-referral" />
                    <Label htmlFor="xray-no-referral" className="font-normal cursor-pointer">
                      No referral needed
                    </Label>
                  </div>
                  <p className="text-xs text-slate-500 ml-6 pl-0.5">
                    e.g. X-ray shows minor or non-TB-related abnormalities, or old, healed TB scars, but is assessed to require no further follow-up
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cleared-ntbcc" id="xray-cleared" />
                  <Label htmlFor="xray-cleared" className="font-normal cursor-pointer">
                    Cleared by National Tuberculosis Care Centre (NTBCC)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending-clearance-ntbcc" id="xray-pending" />
                  <Label htmlFor="xray-pending" className="font-normal cursor-pointer">
                    Pending clearance by National Tuberculosis Care Centre (NTBCC)
                  </Label>
                </div>
                {isFemale && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pregnancy-exempted" id="xray-pregnancy" />
                    <Label htmlFor="xray-pregnancy" className="font-normal cursor-pointer">
                      Pregnancy Exempted
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
            {formData.chestXray === 'pending-clearance-ntbcc' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md space-y-2">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">⚠️ Warning:</span> This form cannot be submitted until NTBCC clearance is obtained.
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">💡 Tip:</span> You may save this as a draft and submit it after receiving clearance.
                </p>
              </div>
            )}
          </div>
          {errors?.chestXray && (
            <p className="text-sm text-red-600 ml-4 md:ml-[244px]">{errors.chestXray}</p>
          )}
        </div>

        {/* Syphilis */}
        <div className="space-y-2">
          <div className="border border-slate-200 rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-4 md:items-start">
              <Label className="text-sm font-normal text-slate-700 md:pt-[3px]">Syphilis <span className="text-red-500">*</span></Label>
              <RadioGroup
                value={formData.syphilis || ''}
                onValueChange={(value: string) => {
                  handleRadioChange('syphilis', value);
                  if (onValidate) {
                    onValidate('syphilis', '');
                  }
                }}
                className="space-y-1.5"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="syphilis-normal" />
                  <Label htmlFor="syphilis-normal" className="font-normal cursor-pointer">
                    Normal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="positive-infectious" 
                    id="syphilis-infectious"
                    className={formData.syphilis === 'positive-infectious' ? 'border-red-600 [&_svg]:fill-red-600 [&_svg]:stroke-red-600' : ''}
                  />
                  <Label 
                    htmlFor="syphilis-infectious" 
                    className={`cursor-pointer ${formData.syphilis === 'positive-infectious' ? 'text-red-600 font-semibold' : 'font-normal'}`}
                  >
                    Positive - Currently Infectious
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive-treated" id="syphilis-treated" />
                  <Label htmlFor="syphilis-treated" className="font-normal cursor-pointer">
                    Positive - Treated Inactive
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          {errors?.syphilis && (
            <p className="text-sm text-red-600 ml-4 md:ml-[244px]">{errors.syphilis}</p>
          )}
        </div>

        {/* Other Medical Tests */}
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Check only if test result is <b>positive</b> or <b>abnormal</b>:
          </p>
          <div className="space-y-0 border border-slate-200 rounded-md p-4">
            {medicalTests.map((test) => {
              if (test.femaleOnly && !isFemale) return null;
              
              return (
                <>
                  <CheckboxField
                    key={test.key}
                    id={`test_${test.key}`}
                    label={test.label}
                    checkboxLabel={test.checkboxLabel}
                    checked={formData[`test_${test.key}`] === 'yes'}
                    onChange={(checked) =>
                      handleCheckboxChange(`test_${test.key}`, checked as boolean)
                    }
                  />
                  {test.key === 'pregnancy' && errors?.pregnancyTest && (
                    <p className="text-sm text-red-600 ml-6 -mt-1 mb-2">{errors.pregnancyTest}</p>
                  )}
                </>
              );
            })}
          </div>
        </div>

        {/* Other Abnormalities */}
        <div className="space-y-2">
          <Label htmlFor="otherAbnormalities">Any other abnormalities</Label>
          <Textarea
            id="otherAbnormalities"
            name="otherAbnormalities"
            value={formData.otherAbnormalities || ''}
            onChange={handleInputChange}
            placeholder="Describe any other abnormalities..."
            rows={4}
          />
        </div>
      </div>
      )}
    </>
  );
}
