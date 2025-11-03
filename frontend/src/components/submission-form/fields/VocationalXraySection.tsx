import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Button } from '../../ui/button';

interface VocationalXraySectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
}

const MEMO_REQUIREMENTS = [
  {
    id: 'amputee',
    label: 'Amputee',
    description: 'Requires Driving Assessment Rehabilitation Programme (DARP) report',
  },
  {
    id: 'cancerChemoRadio',
    label: 'Cancer undergoing Chemotherapy or Radiotherapy',
    description: 'Requires memo from attending physician',
  },
  {
    id: 'endStageRenal',
    label: 'End Stage Renal Failure on Hemodialysis',
    description: 'Requires memo from attending physician for renal illness',
  },
  {
    id: 'hearingProblems',
    label: 'Hearing problems',
    description: 'Requires Audiogram report and memo from hearing specialist/audiologist',
  },
  {
    id: 'heartSurgeryPacemaker',
    label: 'Heart Surgery (with Pacemaker)',
    description: 'Requires memo from Cardiologist',
  },
  {
    id: 'mentalIllness',
    label: 'Mental illness (e.g. Anxiety, Depression, Schizophrenia & Bipolar)',
    description: 'Requires memo from psychiatrist / attending physician for mental illness',
  },
  {
    id: 'stroke',
    label: 'Stroke',
    description: 'Requires Driving Assessment Rehabilitation Programme (DARP) report and memo from Neurologist',
  },
  {
    id: 'tuberculosis',
    label: 'Tuberculosis',
    description: 'Requires TB Certificate of Completion from Tuberculosis Control Unit (TBCU) or Ministry of Health (MOH)',
  },
];

export function VocationalXraySection({
  formData,
  onChange,
  errors,
  onValidate,
}: VocationalXraySectionProps) {
  const handleXrayRequiredChange = (value: string) => {
    onChange('vocationalXrayRequired', value);
    
    // Clear validation error when user makes a selection
    if (onValidate) {
      onValidate('vocationalXrayRequired', '');
    }
    
    // If "No" is selected, clear the examination findings
    if (value === 'no') {
      onChange('vocationalXrayFindings', '');
      if (onValidate) {
        onValidate('vocationalXrayFindings', '');
      }
    }
  };

  const handleXrayFindingsChange = (value: string) => {
    onChange('vocationalXrayFindings', value);
    
    // Clear validation error when user makes a selection
    if (onValidate) {
      onValidate('vocationalXrayFindings', '');
    }
  };

  return (
    <div className="space-y-4">
      {/* Section 1: X-ray Examination */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">X-ray Examination</h3>
        
        {/* Question 1: X-ray Required */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Does the patient need to take X-ray? <span className="text-red-500">*</span>
          </Label>
          
          {/* Informational text */}
          <p className="text-xs text-gray-600 italic">
            X-ray examination is only required for new applicant of vocational licence or if instructed by LTA
          </p>
          
          <RadioGroup
            value={formData.vocationalXrayRequired || ''}
            onValueChange={handleXrayRequiredChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="xray-yes" />
              <Label htmlFor="xray-yes" className="font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="xray-no" />
              <Label htmlFor="xray-no" className="font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
          {errors?.vocationalXrayRequired && (
            <p className="text-sm text-red-500">{errors.vocationalXrayRequired}</p>
          )}
        </div>

        {/* Question 2: X-ray Findings (only shown if Yes) */}
        {formData.vocationalXrayRequired === 'yes' && (
          <div className="space-y-3 ml-8 p-4 border-l-2 border-blue-200 bg-blue-50/30">
            <Label className="text-base font-semibold">
              I have examined the patient's X-ray report as follows: <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.vocationalXrayFindings || ''}
              onValueChange={handleXrayFindingsChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_lesion" id="xray-no-lesion" />
                <Label htmlFor="xray-no-lesion" className="font-normal cursor-pointer">
                  There is no radiological evidence of chest lesion
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tb" id="xray-tb" />
                <Label htmlFor="xray-tb" className="font-normal cursor-pointer">
                  The patient is suffering from TB
                </Label>
              </div>
            </RadioGroup>
            {errors?.vocationalXrayFindings && (
              <p className="text-sm text-red-500">{errors.vocationalXrayFindings}</p>
            )}

            {/* Remarks - Optional */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="vocationalXrayRemarks">
                Remarks (Optional)
              </Label>
              <Textarea
                id="vocationalXrayRemarks"
                value={formData.vocationalXrayRemarks || ''}
                onChange={(e) => onChange('vocationalXrayRemarks', e.target.value)}
                placeholder="Enter any additional remarks about the X-ray examination..."
                rows={4}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Memo Requirements */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Memo Requirements</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            If the patient has any of the following medical conditions, additional memo is required.
            Please check all that apply to this patient:
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange('memoRequirements', JSON.stringify({}))}
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            Clear All
          </Button>
        </div>

        <div className="space-y-3">
          {MEMO_REQUIREMENTS.map((requirement) => {
            const memoData = formData.memoRequirements ? 
              (typeof formData.memoRequirements === 'string' ? 
                JSON.parse(formData.memoRequirements) : 
                formData.memoRequirements) 
              : {};
            
            const isChecked = memoData[requirement.id] === true;
            
            return (
              <div key={requirement.id} className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white rounded border border-gray-100">
                  <Checkbox
                    id={`memo-${requirement.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const updated = {
                        ...memoData,
                        [requirement.id]: checked === true,
                      };
                      onChange('memoRequirements', JSON.stringify(updated));
                      
                      // Clear related fields if unchecking
                      if (!checked) {
                        onChange(`memoProvided_${requirement.id}`, '');
                        onChange(`furtherMemoRequired_${requirement.id}`, '');
                        onChange(`memoRemarks_${requirement.id}`, '');
                        if (onValidate) {
                          onValidate(`memoProvided_${requirement.id}`, '');
                          onValidate(`furtherMemoRequired_${requirement.id}`, '');
                        }
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`memo-${requirement.id}`}
                      className="font-medium text-sm cursor-pointer"
                    >
                      {requirement.label}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      {requirement.description}
                    </p>
                  </div>
                </div>

                {/* Conditional Questions for this specific condition */}
                {isChecked && (
                  <div className="ml-8 space-y-4 p-4 border-l-2 border-blue-200 bg-blue-50/30">
                    {/* Question 1: Has memo been provided */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">
                        Has the patient provided you a certified memo/report for this condition? <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={formData[`memoProvided_${requirement.id}`] || ''}
                        onValueChange={(value: string) => {
                          onChange(`memoProvided_${requirement.id}`, value);
                          if (onValidate) {
                            onValidate(`memoProvided_${requirement.id}`, '');
                          }
                          // Clear further memo fields if changing from yes to no
                          if (value === 'no') {
                            onChange(`furtherMemoRequired_${requirement.id}`, '');
                            onChange(`memoRemarks_${requirement.id}`, '');
                            if (onValidate) {
                              onValidate(`furtherMemoRequired_${requirement.id}`, '');
                            }
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id={`memo-provided-yes-${requirement.id}`} />
                          <Label htmlFor={`memo-provided-yes-${requirement.id}`} className="font-normal cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`memo-provided-no-${requirement.id}`} />
                          <Label htmlFor={`memo-provided-no-${requirement.id}`} className="font-normal cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors?.[`memoProvided_${requirement.id}`] && (
                        <p className="text-sm text-red-500">{errors[`memoProvided_${requirement.id}`]}</p>
                      )}
                    </div>

                    {/* Question 2: Further memo required (only if Yes to first question) */}
                    {formData[`memoProvided_${requirement.id}`] === 'yes' && (
                      <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                        <Label className="text-sm font-semibold">
                          Is any further memo/report required? <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          value={formData[`furtherMemoRequired_${requirement.id}`] || ''}
                          onValueChange={(value: string) => {
                            onChange(`furtherMemoRequired_${requirement.id}`, value);
                            if (onValidate) {
                              onValidate(`furtherMemoRequired_${requirement.id}`, '');
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`further-memo-yes-${requirement.id}`} />
                            <Label htmlFor={`further-memo-yes-${requirement.id}`} className="font-normal cursor-pointer">
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`further-memo-no-${requirement.id}`} />
                            <Label htmlFor={`further-memo-no-${requirement.id}`} className="font-normal cursor-pointer">
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                        {errors?.[`furtherMemoRequired_${requirement.id}`] && (
                          <p className="text-sm text-red-500">{errors[`furtherMemoRequired_${requirement.id}`]}</p>
                        )}

                        {/* Remarks - Optional */}
                        <div className="space-y-2 mt-4">
                          <Label htmlFor={`memoRemarks-${requirement.id}`}>
                            Remarks (Optional)
                          </Label>
                          <Textarea
                            id={`memoRemarks-${requirement.id}`}
                            value={formData[`memoRemarks_${requirement.id}`] || ''}
                            onChange={(e) => onChange(`memoRemarks_${requirement.id}`, e.target.value)}
                            placeholder="Enter any additional remarks about the memo requirements..."
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
