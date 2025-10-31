import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';

interface MedicalHistorySectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function MedicalHistorySection({ formData, onChange }: MedicalHistorySectionProps) {
  const history = formData.medicalHistory || {};

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onChange('medicalHistory', {
      ...history,
      [field]: checked,
    });
  };

  const handleOtherTextChange = (value: string) => {
    onChange('medicalHistory', {
      ...history,
      other: value,
    });
  };

  const handleAllNormal = () => {
    onChange('medicalHistory', {
      cardiovascular: false,
      neurological: false,
      psychiatric: false,
      diabetes: false,
      vision: false,
      hearing: false,
      musculoskeletal: false,
      other: '',
    });
  };

  const historyItems = [
    { id: 'cardiovascular', label: 'Cardiovascular disease (heart attack, angina, hypertension)' },
    { id: 'neurological', label: 'Neurological disorder (stroke, epilepsy, MS)' },
    { id: 'psychiatric', label: 'Psychiatric condition (depression, anxiety, psychosis)' },
    { id: 'diabetes', label: 'Diabetes mellitus (Type 1 or 2)' },
    { id: 'vision', label: 'Vision problems (glaucoma, cataracts, retinopathy)' },
    { id: 'hearing', label: 'Hearing problems (deafness, tinnitus)' },
    { id: 'musculoskeletal', label: 'Musculoskeletal disorder (arthritis, amputation)' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Does the examinee have any pre-existing medical conditions?
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleAllNormal}>
          All Normal
        </Button>
      </div>

      <div className="space-y-3">
        {historyItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={history[item.id] || false}
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
              id="otherHistoryCheck"
              checked={!!history.other}
              onCheckedChange={(checked) => {
                if (!checked) {
                  handleOtherTextChange('');
                }
              }}
            />
            <Label
              htmlFor="otherHistoryCheck"
              className="text-sm font-normal cursor-pointer"
            >
              Other conditions
            </Label>
          </div>
          {(history.other !== undefined && history.other !== '') && (
            <Input
              id="otherHistory"
              type="text"
              placeholder="Please specify..."
              maxLength={200}
              value={history.other || ''}
              onChange={(e) => handleOtherTextChange(e.target.value)}
              className="ml-6"
            />
          )}
          {history.other && (
            <p className="text-xs text-gray-500 ml-6">
              {history.other.length}/200 characters
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
