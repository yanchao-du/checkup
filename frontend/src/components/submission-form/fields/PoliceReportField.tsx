import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';

interface PoliceReportFieldProps {
  value: string;
  onChange: (value: string) => void;
  externalError?: string | null;
  
}

export function PoliceReportField({ value, onChange, externalError }: PoliceReportFieldProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-slate-200">
      <Label className="text-sm font-medium text-slate-900">
        Have you made a police report? *
      </Label>
      <RadioGroup value={value} onValueChange={onChange} aria-invalid={!!externalError}>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="policeReport-yes" aria-invalid={!!externalError} />
            <Label htmlFor="policeReport-yes" className="text-sm font-normal cursor-pointer">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="policeReport-no" aria-invalid={!!externalError} />
            <Label htmlFor="policeReport-no" className="text-sm font-normal cursor-pointer">
              No
            </Label>
          </div>
        </div>
      </RadioGroup>
      {externalError && (
        <p className="text-xs text-red-600 mt-1">{externalError}</p>
      )}
    </div>
  );
}
