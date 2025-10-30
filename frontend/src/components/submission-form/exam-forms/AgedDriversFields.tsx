import { VisualAcuityField } from '../fields/VisualAcuityField';
import { HearingTestField } from '../fields/HearingTestField';
import { DiabetesField } from '../fields/DiabetesField';

interface AgedDriversFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
}

export function AgedDriversFields({ formData, onChange }: AgedDriversFieldsProps) {
  return (
    <div className="space-y-4">
      <VisualAcuityField
        value={formData.visualAcuity || ''}
        onChange={(value) => onChange('visualAcuity', value)}
      />
      <HearingTestField
        value={formData.hearingTest || ''}
        onChange={(value) => onChange('hearingTest', value)}
      />
      <DiabetesField
        value={formData.diabetes || ''}
        onChange={(value) => onChange('diabetes', value)}
      />
    </div>
  );
}
