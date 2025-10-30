import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function CheckboxField({ id, label, checked, onChange, description }: CheckboxFieldProps) {
  return (
    <div className="flex items-start space-x-3 space-y-0">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      />
      <div className="space-y-1 leading-none">
        <Label
          htmlFor={id}
          className="text-sm font-normal cursor-pointer"
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}
