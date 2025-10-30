import { HivTestField } from '../fields/HivTestField';
import { TbTestField } from '../fields/TbTestField';

interface WorkPermitFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
}

export function WorkPermitFields({ formData, onChange }: WorkPermitFieldsProps) {
  return (
    <div className="space-y-4">
      <HivTestField
        value={formData.hivTest || ''}
        onChange={(value) => onChange('hivTest', value)}
      />
      <TbTestField
        value={formData.tbTest || ''}
        onChange={(value) => onChange('tbTest', value)}
      />
    </div>
  );
}
