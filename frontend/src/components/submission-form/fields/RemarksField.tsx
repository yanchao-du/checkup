import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';

interface RemarksFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function RemarksField({ value, onChange }: RemarksFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="remarks">Additional Remarks</Label>
      <Textarea
        id="remarks"
        value={value}
        onChange={handleChange}
        placeholder="Enter any additional medical findings or notes"
        rows={4}
      />
    </div>
  );
}
