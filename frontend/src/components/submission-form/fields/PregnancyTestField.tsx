import { Label } from '../../ui/label';

interface PregnancyTestFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function PregnancyTestField({ value, onChange }: PregnancyTestFieldProps) {
  const isPositive = value === 'Positive';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked ? 'Positive' : 'Negative');
  };

  return (
    <div className="space-y-2">
      <Label>Pregnancy Test</Label>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="preg-positive"
          checked={isPositive}
          onChange={handleChange}
          className="form-checkbox h-5 w-5 text-orange-500"
        />
        <Label 
          htmlFor="preg-positive" 
          className={isPositive ? 'text-orange-500 font-semibold' : ''}
        >
          Positive
        </Label>
      </div>
    </div>
  );
}
