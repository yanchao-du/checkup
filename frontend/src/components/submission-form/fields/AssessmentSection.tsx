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
      <p className="text-sm text-gray-600">
        Medical Practitioner's Assessment and Determination
      </p>

      {/* Fit to Drive (TP exams) */}
      {showFitToDrive && (
        <div>
          <Label>Fit to Drive <span className="text-red-500">*</span></Label>
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

      {/* Requires Specialist Review */}
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

      {/* Specialist Type (conditional) */}
      {assessment.requiresSpecialistReview === true && (
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

      {/* Medical Practitioner Remarks */}
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
    </div>
  );
}
