import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface HearingTestFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function HearingTestField({ value, onChange }: HearingTestFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="hearingTest">Hearing Test</Label>
      <Input
        id="hearingTest"
        value={value}
        onChange={handleChange}
        placeholder="Normal / Impaired"
      />
    </div>
  );
}
