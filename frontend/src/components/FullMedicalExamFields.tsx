import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface FullMedicalExamFieldsProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  gender?: string;
}

export function FullMedicalExamFields({
  formData,
  handleInputChange,
  gender,
}: FullMedicalExamFieldsProps) {
  const isFemale = gender === 'F';

  // Medical History conditions
  const medicalHistoryConditions = [
    { key: 'cardiovascular', label: 'Cardiovascular disease (e.g. ischemic heart disease)' },
    { key: 'metabolic', label: 'Metabolic disease (diabetes, hypertension)' },
    { key: 'respiratory', label: 'Respiratory disease (e.g. tuberculosis, asthma)' },
    { key: 'gastrointestinal', label: 'Gastrointestinal disease (e.g. peptic ulcer disease)' },
    { key: 'neurological', label: 'Neurological disease (e.g. epilepsy, stroke)' },
    { key: 'mentalHealth', label: 'Mental health condition (e.g. depression)' },
    { key: 'otherMedical', label: 'Other medical condition' },
    { key: 'previousSurgeries', label: 'Previous surgeries' },
    { key: 'longTermMedications', label: 'Long-term medications' },
    { key: 'smokingHistory', label: 'Smoking History (tobacco)' },
    { key: 'lifestyleRiskFactors', label: 'Other lifestyle risk factors or significant family history' },
    { key: 'previousInfections', label: 'Previous infections of concern (e.g. COVID-19)' },
  ];

  // Medical Examination tests
  const medicalTests = [
    { key: 'hiv', label: 'HIV' },
    { key: 'pregnancy', label: 'Pregnancy', femaleOnly: true },
    { key: 'urineAlbumin', label: 'Urine Albumin' },
    { key: 'urineSugar', label: 'Urine Sugar' },
    { key: 'bloodPressure', label: 'Blood Pressure' },
    { key: 'malaria', label: 'Malaria' },
    { key: 'colourVision', label: 'Colour Vision' },
  ];

  const handleCheckboxChange = (field: string, checked: boolean) => {
    handleInputChange({
      target: {
        name: field,
        value: checked ? 'yes' : '',
      },
    } as any);
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
      {/* Medical History Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="medical-history">
          <AccordionTrigger className="text-lg font-semibold">
            Medical History of Patient
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3">
              {medicalHistoryConditions.map((condition) => (
                <div key={condition.key} className="flex items-start space-x-3">
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
                    className="font-normal cursor-pointer"
                  >
                    {condition.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Medical Examination Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="medical-examination">
          <AccordionTrigger className="text-lg font-semibold">
            Medical Examination
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* Chest X-ray */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Chest X-ray</Label>
              <RadioGroup
                value={formData.chestXray || ''}
                onValueChange={(value: string) => handleRadioChange('chestXray', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="xray-normal" />
                  <Label htmlFor="xray-normal" className="font-normal cursor-pointer">
                    Normal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-referral" id="xray-no-referral" />
                  <Label htmlFor="xray-no-referral" className="font-normal cursor-pointer">
                    No referral needed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cleared-ntbcc" id="xray-cleared" />
                  <Label htmlFor="xray-cleared" className="font-normal cursor-pointer">
                    Cleared by NTBCC
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

            {/* Syphilis */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Syphilis</Label>
              <RadioGroup
                value={formData.syphilis || ''}
                onValueChange={(value: string) => handleRadioChange('syphilis', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="syphilis-normal" />
                  <Label htmlFor="syphilis-normal" className="font-normal cursor-pointer">
                    Normal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive-infectious" id="syphilis-infectious" />
                  <Label htmlFor="syphilis-infectious" className="font-normal cursor-pointer">
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

            {/* Medical Tests */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Tests (check if positive/reactive/abnormal)
              </Label>
              <div className="space-y-3">
                {medicalTests.map((test) => {
                  if (test.femaleOnly && !isFemale) return null;
                  
                  return (
                    <div key={test.key} className="flex items-center space-x-3">
                      <Checkbox
                        id={`test_${test.key}`}
                        name={`test_${test.key}`}
                        checked={formData[`test_${test.key}`] === 'yes'}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(`test_${test.key}`, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`test_${test.key}`}
                        className="font-normal cursor-pointer"
                      >
                        {test.label}
                      </Label>
                    </div>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Overall Assessment */}
      <div className="space-y-4 p-6 border rounded-lg bg-slate-50">
        <Label className="text-base font-medium">Overall Result</Label>
        <div className="space-y-3">
          <Label className="text-sm font-normal">Is this patient fit for work?</Label>
          <RadioGroup
            value={formData.fitForWork || ''}
            onValueChange={(value: string) => handleRadioChange('fitForWork', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="fit-yes" />
              <Label htmlFor="fit-yes" className="font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="fit-no" />
              <Label htmlFor="fit-no" className="font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </>
  );
}
