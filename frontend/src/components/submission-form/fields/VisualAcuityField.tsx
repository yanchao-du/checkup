import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface VisualAcuityFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function VisualAcuityField({ value, onChange }: VisualAcuityFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="visualAcuity">Visual Acuity</Label>
      <Input
        id="visualAcuity"
        value={value}
        onChange={handleChange}
        placeholder="6/6"
      />
    </div>
  );
}
