import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';

interface MdwRemarksFieldProps {
  hasAdditionalRemarks: boolean;
  remarks: string;
  onHasAdditionalRemarksChange: (checked: boolean) => void;
  onRemarksChange: (value: string) => void;
}

export function MdwRemarksField({ 
  hasAdditionalRemarks, 
  remarks, 
  onHasAdditionalRemarksChange, 
  onRemarksChange 
}: MdwRemarksFieldProps) {
  const maxLength = 500;
  const remainingChars = maxLength - remarks.length;

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3 space-y-0">
        <Checkbox
          id="hasAdditionalRemarks"
          checked={hasAdditionalRemarks}
          onCheckedChange={onHasAdditionalRemarksChange}
        />
        <div className="space-y-1 leading-none">
          <Label
            htmlFor="hasAdditionalRemarks"
            className="text-sm font-normal cursor-pointer"
          >
            I have something else to report to MOM about the helper
          </Label>
        </div>
      </div>
      
      {hasAdditionalRemarks && (
        <div className="space-y-2 pl-7">
          {/* <Label htmlFor="remarks">Additional Remarks</Label> */}
          <Textarea
            id="remarks"
            name="remarks"
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            placeholder="Enter additional remarks..."
            maxLength={maxLength}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-slate-500">
            {remainingChars} characters remaining
          </p>
        </div>
      )}
    </div>
  );
}
