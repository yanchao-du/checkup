import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { getTodayInSingapore } from '../utils/date';

interface DateOfBirthFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function DateOfBirthField({ value, onChange, required = true }: DateOfBirthFieldProps) {
  const today = getTodayInSingapore();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="dob">Date of Birth {required && <span className="text-red-500">*</span>}</Label>
      <Input
        id="dob"
        name="dateOfBirth"
        type="date"
        value={value}
        max={today}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
