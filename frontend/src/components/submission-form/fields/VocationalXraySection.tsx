import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Textarea } from '../../ui/textarea';

interface VocationalXraySectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
}

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
          <div className="space-y-3 pl-4 border-l-2 border-slate-200">
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
    </div>
  );
}
