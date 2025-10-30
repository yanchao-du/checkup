import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface ChestXrayFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChestXrayField({ value, onChange }: ChestXrayFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="chestXray">Chest X-Ray Result</Label>
      <Input
        id="chestXray"
        value={value}
        onChange={handleChange}
        placeholder="Normal / Abnormal findings"
      />
    </div>
  );
}
