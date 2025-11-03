import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';

interface AssessmentSectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  examType: 'DRIVING_LICENCE_TP' | 'DRIVING_VOCATIONAL_TP_LTA' | 'VOCATIONAL_LICENCE_LTA';
}

export function AssessmentSection({ formData, onChange, examType }: AssessmentSectionProps) {
  const assessment = formData.assessment || {};

  const handleFieldChange = (field: string, value: any) => {
    onChange('assessment', {
      ...assessment,
      [field]: value,
    });
  };

  const showFitToDrive = examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA';
  const showFitForVocational = examType === 'DRIVING_VOCATIONAL_TP_LTA' || examType === 'VOCATIONAL_LICENCE_LTA';

  return (
    <div className="space-y-4">

      {/* Fit to Drive (TP exams) */}
      {showFitToDrive && (
        <div>
          <Label>Is the patient physically and mentally fit to drive a motor vehicle? <span className="text-red-500">*</span></Label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitToDrive"
                value="true"
                checked={assessment.fitToDrive === true}
                onChange={() => handleFieldChange('fitToDrive', true)}
                className="h-4 w-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitToDrive"
                value="false"
                checked={assessment.fitToDrive === false}
                onChange={() => handleFieldChange('fitToDrive', false)}
                className="h-4 w-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>
      )}

      {/* Fit for Vocational Duty (LTA exams) */}
      {showFitForVocational && (
        <div>
          <Label>Fit for Vocational Duty <span className="text-red-500">*</span></Label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitForVocational"
                value="true"
                checked={assessment.fitForVocational === true}
                onChange={() => handleFieldChange('fitForVocational', true)}
                className="h-4 w-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitForVocational"
                value="false"
                checked={assessment.fitForVocational === false}
                onChange={() => handleFieldChange('fitForVocational', false)}
                className="h-4 w-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>
      )}

      {/* Requires Specialist Review - Only for LTA exams */}
      {showFitForVocational && (
        <div>
          <Label>Requires Specialist Review</Label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="requiresSpecialistReview"
                value="true"
                checked={assessment.requiresSpecialistReview === true}
                onChange={() => handleFieldChange('requiresSpecialistReview', true)}
                className="h-4 w-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="requiresSpecialistReview"
                value="false"
                checked={assessment.requiresSpecialistReview === false}
                onChange={() => handleFieldChange('requiresSpecialistReview', false)}
                className="h-4 w-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>
      )}

      {/* Specialist Type (conditional) - Only for LTA exams */}
      {showFitForVocational && assessment.requiresSpecialistReview === true && (
        <div>
          <Label htmlFor="specialistType">Specialist Type <span className="text-red-500">*</span></Label>
          <Input
            id="specialistType"
            type="text"
            placeholder="e.g., Cardiologist, Neurologist"
            value={assessment.specialistType || ''}
            onChange={(e) => handleFieldChange('specialistType', e.target.value)}
          />
        </div>
      )}

      {/* Medical Practitioner Remarks - Only for LTA exams */}
      {showFitForVocational && (
        <div>
          <Label htmlFor="remarks">Medical Practitioner Remarks <span className="text-red-500">*</span></Label>
          <Textarea
            id="remarks"
            placeholder="Enter your professional assessment and any relevant observations (max 500 characters)"
            rows={4}
            maxLength={500}
            value={assessment.remarks || ''}
            onChange={(e) => handleFieldChange('remarks', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            {(assessment.remarks || '').length}/500 characters
          </p>
        </div>
      )}

      {/* Medical Practitioner Declaration */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-gray-900">Medical Practitioner Declaration</h4>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            I certify that I have examined and identified the patient named above:
          </p>
          <ul className="ml-6 mb-4 space-y-2 text-sm text-gray-700 list-disc">
            <li>He/she has presented his/her identity card, which bears the same name and identification number as on this form.</li>
            <li>The answers to the questions above are correct to the best of my knowledge.</li>
          </ul>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={assessment.declarationAgreed === true}
              onChange={(e) => handleFieldChange('declarationAgreed', e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900">
              I agree to the above declaration <span className="text-red-500">*</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
