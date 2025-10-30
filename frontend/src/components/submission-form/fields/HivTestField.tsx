import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface HivTestFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function HivTestField({ value, onChange }: HivTestFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="hivTest">HIV Test Result</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="hivTest">
          <SelectValue placeholder="Select result" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Negative">Negative</SelectItem>
          <SelectItem value="Positive">Positive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
