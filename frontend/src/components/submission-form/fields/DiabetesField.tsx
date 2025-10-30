import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';

interface DiabetesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DiabetesField({ value, onChange }: DiabetesFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Diabetes</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Yes" id="diabetes-yes" />
          <Label htmlFor="diabetes-yes">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="No" id="diabetes-no" />
          <Label htmlFor="diabetes-no">No</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
