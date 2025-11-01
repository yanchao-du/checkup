import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

interface DateOfBirthFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function DateOfBirthField({ value, onChange, required = true }: DateOfBirthFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="dob">Date of Birth {required && '*'}</Label>
      <Input
        id="dob"
        name="dateOfBirth"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
