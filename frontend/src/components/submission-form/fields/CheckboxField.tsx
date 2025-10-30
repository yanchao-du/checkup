import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';

interface CheckboxFieldProps {
  id: string;
  label: string;
  checkboxLabel: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  showWarning?: boolean;
  warningMessage?: string;
}

export function CheckboxField({ 
  id, 
  label, 
  checkboxLabel, 
  checked, 
  onChange, 
  description,
  showWarning,
  warningMessage 
}: CheckboxFieldProps) {
  return (
    <div className="py-2 border-b border-slate-100 last:border-b-0">
      <div className="grid grid-cols-2 gap-4 items-center">
        <div>
          <Label className="text-sm font-normal text-slate-700">
            {label}
          </Label>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            className={checked ? 'bg-red-600 border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600' : ''}
          />
          <Label
            htmlFor={id}
            className={`text-sm font-medium cursor-pointer ${checked ? 'text-red-600' : 'text-slate-600'}`}
          >
            {checkboxLabel}
          </Label>
        </div>
      </div>
      {showWarning && warningMessage && (
        <div className="mt-2 ml-0">
          <p className="text-sm text-amber-700">{warningMessage}</p>
        </div>
      )}
    </div>
  );
}
