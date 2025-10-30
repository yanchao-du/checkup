import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface TbTestFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function TbTestField({ value, onChange }: TbTestFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tbTest">TB Test Result</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="tbTest">
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
