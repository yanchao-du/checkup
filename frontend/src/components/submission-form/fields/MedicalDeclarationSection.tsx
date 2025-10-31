import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';

interface MedicalDeclarationSectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function MedicalDeclarationSection({ formData, onChange }: MedicalDeclarationSectionProps) {
  const declaration = formData.medicalDeclaration || {};

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onChange('medicalDeclaration', {
      ...declaration,
      [field]: checked,
    });
  };

  const handleOtherTextChange = (value: string) => {
    onChange('medicalDeclaration', {
      ...declaration,
      otherConditions: value,
    });
  };

  const handleClearAll = () => {
    onChange('medicalDeclaration', {
      lossOfConsciousness: false,
      seizures: false,
      suddenDizziness: false,
      chestPain: false,
      breathlessness: false,
      substanceAbuse: false,
      psychiatricCondition: false,
      otherConditions: '',
    });
  };

  const declarations = [
    { id: 'lossOfConsciousness', label: 'Loss of consciousness/fainting' },
    { id: 'seizures', label: 'Seizures or fits' },
    { id: 'suddenDizziness', label: 'Sudden dizziness or blackouts' },
    { id: 'chestPain', label: 'Chest pain or discomfort' },
    { id: 'breathlessness', label: 'Breathlessness during mild exertion' },
    { id: 'substanceAbuse', label: 'Alcohol or substance abuse' },
    { id: 'psychiatricCondition', label: 'Psychiatric condition requiring treatment' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Has the examinee experienced any of the following in the past 6 months?
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleClearAll}>
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {declarations.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={declaration[item.id] || false}
              onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
            />
            <Label
              htmlFor={item.id}
              className="text-sm font-normal cursor-pointer"
            >
              {item.label}
            </Label>
          </div>
        ))}

        {/* Other conditions with text field */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="otherConditionsCheck"
              checked={!!declaration.otherConditions}
              onCheckedChange={(checked) => {
                if (!checked) {
                  handleOtherTextChange('');
                }
              }}
            />
            <Label
              htmlFor="otherConditionsCheck"
              className="text-sm font-normal cursor-pointer"
            >
              Other medical conditions
            </Label>
          </div>
          {(declaration.otherConditions !== undefined && declaration.otherConditions !== '') && (
            <Input
              id="otherConditions"
              type="text"
              placeholder="Please specify..."
              maxLength={200}
              value={declaration.otherConditions || ''}
              onChange={(e) => handleOtherTextChange(e.target.value)}
              className="ml-6"
            />
          )}
          {declaration.otherConditions && (
            <p className="text-xs text-gray-500 ml-6">
              {declaration.otherConditions.length}/200 characters
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
