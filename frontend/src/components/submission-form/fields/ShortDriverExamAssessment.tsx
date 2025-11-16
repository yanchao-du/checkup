import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';

interface ShortDriverExamAssessmentProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  purposeOfExam?: string;
  errors?: Record<string, string>;
}

const PURPOSE_LABELS: Record<string, string> = {
  AGE_65_ABOVE_TP_ONLY: 'Age 65+ TP Only',
  AGE_65_ABOVE_TP_LTA: 'Age 65+ TP & LTA',
  AGE_64_BELOW_LTA_ONLY: 'Age 64 & Below LTA Only',
  BAVL_ANY_AGE: 'BAVL (Any Age)',
};

export function ShortDriverExamAssessment({
  formData,
  onChange,
  purposeOfExam,
  errors = {},
}: ShortDriverExamAssessmentProps) {
  // Determine which fitness questions to show based on purpose
  const showMotorVehicleFitness = 
    purposeOfExam === 'AGE_65_ABOVE_TP_ONLY' || 
    purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
    purposeOfExam === 'AGE_64_BELOW_LTA_ONLY';
  
  const showPsvBavlFitness = 
    purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
    purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' ||
    purposeOfExam === 'BAVL_ANY_AGE';

  return (
    <div className="space-y-6">
      {/* Purpose of Exam - Read-only display */}
      {purposeOfExam && (
        <div>
          <Label className="text-sm font-medium">Purpose of Examination</Label>
          <div className="mt-1.5 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-900">{PURPOSE_LABELS[purposeOfExam] || purposeOfExam}</p>
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-base font-semibold mb-4">Fitness Determination</h3>
        
        {/* Motor Vehicle Fitness Question */}
        {showMotorVehicleFitness && (
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">
              Is the examinee physically and mentally fit to drive a motor vehicle?
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <RadioGroup
              value={formData.fitToDriveMotorVehicle || ''}
              onValueChange={(value: string) => onChange('fitToDriveMotorVehicle', value)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="yes" id="motor-vehicle-yes" />
                <Label htmlFor="motor-vehicle-yes" className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="motor-vehicle-no" />
                <Label htmlFor="motor-vehicle-no" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
            {errors.fitToDriveMotorVehicle && (
              <p className="text-sm text-red-500 mt-1">{errors.fitToDriveMotorVehicle}</p>
            )}
          </div>
        )}

        {/* PSV/BAVL Fitness Question */}
        {showPsvBavlFitness && (
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">
              Is the examinee physically and mentally fit to drive a PSV and/or hold a BAVL?
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <RadioGroup
              value={formData.fitToDrivePsvBavl || ''}
              onValueChange={(value: string) => onChange('fitToDrivePsvBavl', value)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="yes" id="psv-bavl-yes" />
                <Label htmlFor="psv-bavl-yes" className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="psv-bavl-no" />
                <Label htmlFor="psv-bavl-no" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
            {errors.fitToDrivePsvBavl && (
              <p className="text-sm text-red-500 mt-1">{errors.fitToDrivePsvBavl}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
