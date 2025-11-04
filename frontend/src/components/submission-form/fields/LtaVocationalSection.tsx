import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface LtaVocationalSectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function LtaVocationalSection({ formData, onChange }: LtaVocationalSectionProps) {
  const ltaVocational = formData.ltaVocational || {};

  const handleFieldChange = (field: string, value: any) => {
    onChange('ltaVocational', {
      ...ltaVocational,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        LTA Vocational Licence Medical Assessment
      </p>

      {/* Vision Assessments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="colorVision">Color Vision <span className="text-red-500">*</span></Label>
          <Select
            value={ltaVocational.colorVision || ''}
            onValueChange={(value: string) => handleFieldChange('colorVision', value)}
          >
            <SelectTrigger id="colorVision">
              <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pass">Pass</SelectItem>
              <SelectItem value="Fail">Fail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="peripheralVision">Peripheral Vision <span className="text-red-500">*</span></Label>
          <Select
            value={ltaVocational.peripheralVision || ''}
            onValueChange={(value: string) => handleFieldChange('peripheralVision', value)}
          >
            <SelectTrigger id="peripheralVision">
              <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pass">Pass</SelectItem>
              <SelectItem value="Fail">Fail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="nightVision">Night Vision <span className="text-red-500">*</span></Label>
          <Select
            value={ltaVocational.nightVision || ''}
            onValueChange={(value: string) => handleFieldChange('nightVision', value)}
          >
            <SelectTrigger id="nightVision">
              <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pass">Pass</SelectItem>
              <SelectItem value="Fail">Fail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Medical Condition Assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cardiacCondition">Cardiac Condition Assessment</Label>
          <Textarea
            id="cardiacCondition"
            placeholder="Enter assessment or leave blank if none"
            rows={2}
            value={ltaVocational.cardiacCondition || ''}
            onChange={(e) => handleFieldChange('cardiacCondition', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="respiratoryCondition">Respiratory Condition Assessment</Label>
          <Textarea
            id="respiratoryCondition"
            placeholder="Enter assessment or leave blank if none"
            rows={2}
            value={ltaVocational.respiratoryCondition || ''}
            onChange={(e) => handleFieldChange('respiratoryCondition', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="renalCondition">Renal Condition Assessment</Label>
          <Textarea
            id="renalCondition"
            placeholder="Enter assessment or leave blank if none"
            rows={2}
            value={ltaVocational.renalCondition || ''}
            onChange={(e) => handleFieldChange('renalCondition', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="endocrineCondition">Endocrine Condition Assessment</Label>
          <Textarea
            id="endocrineCondition"
            placeholder="Enter assessment or leave blank if none"
            rows={2}
            value={ltaVocational.endocrineCondition || ''}
            onChange={(e) => handleFieldChange('endocrineCondition', e.target.value)}
          />
        </div>
      </div>

      {/* Fit for Vocational Duty */}
      <div>
        <Label>Fit for Vocational Duty <span className="text-red-500">*</span></Label>
        <div className="flex items-center space-x-4 mt-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="fitForVocational"
              value="true"
              checked={ltaVocational.fitForVocational === true}
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
              checked={ltaVocational.fitForVocational === false}
              onChange={() => handleFieldChange('fitForVocational', false)}
              className="h-4 w-4"
            />
            <span className="text-sm">No</span>
          </label>
        </div>
      </div>

      {/* Restrictions */}
      <div>
        <Label htmlFor="restrictions">Restrictions or Limitations</Label>
        <Textarea
          id="restrictions"
          placeholder="Enter any restrictions or limitations (max 500 characters)"
          rows={3}
          maxLength={500}
          value={ltaVocational.restrictions || ''}
          onChange={(e) => handleFieldChange('restrictions', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(ltaVocational.restrictions || '').length}/500 characters
        </p>
      </div>
    </div>
  );
}
