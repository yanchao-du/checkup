import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Checkbox } from '../../ui/checkbox';

interface IcaExamFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
  remarksError?: string | null;
  setRemarksError?: (err: string | null) => void;
  chestXrayTbError?: string | null;
}

export function IcaExamFields({ 
  formData, 
  onChange,
  chestXrayTbError,
}: IcaExamFieldsProps) {
  const handleCheckboxChange = (key: string, checked: boolean) => {
    onChange(key, checked ? 'true' : 'false');
  };

  const POSITIVE = 'Positive/Reactive';

  return (
    <div className="space-y-6">
      {/* Test Results */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Test Results</h3>
        
        {/* TB (Chest X-ray) - Moved to first position */}
        <div className="border border-slate-200 rounded-md p-4">
          <div className="py-2">
            <div className="grid grid-cols-2 gap-4 items-start">
              <div>
                <Label className="text-sm font-normal text-slate-700">
                  TB (Chest X-ray) <span className="text-red-500">*</span>
                </Label>
              </div>
              <RadioGroup
                value={formData.chestXrayTb || ''}
                onValueChange={(value: string) => onChange('chestXrayTb', value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="tb-no" />
                  <Label htmlFor="tb-no" className="text-sm font-medium cursor-pointer text-slate-600">
                    No active TB detected
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="yes" 
                    id="tb-yes"
                    className={formData.chestXrayTb === 'yes' ? 'border-red-600 [&_svg]:fill-red-600 [&_svg]:stroke-red-600' : ''}
                  />
                  <Label htmlFor="tb-yes" className={`text-sm font-medium cursor-pointer ${formData.chestXrayTb === 'yes' ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                    Active TB detected
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pregnancy-exempted" id="tb-pregnancy" />
                  <Label htmlFor="tb-pregnancy" className="text-sm font-medium cursor-pointer text-slate-600">
                    Exempted due to pregnancy
                  </Label>
                </div>
              </RadioGroup>
            </div>
            {chestXrayTbError && (
              <p className="text-sm text-red-600 mt-2">{chestXrayTbError}</p>
            )}
          </div>
        </div>

        {/* HIV Test */}
        <div className="border border-slate-200 rounded-md p-4">
          <div className="py-2">
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <Label className="text-sm font-normal text-slate-700">
                  HIV test
                </Label>
                <p className="text-xs text-slate-500 mt-1">Note: HIV test must be done by an MOH-approved laboratory.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hivTestPositive"
                  checked={formData.hivTestPositive === 'true'}
                  onCheckedChange={(checked) => handleCheckboxChange('hivTestPositive', checked as boolean)}
                  className={formData.hivTestPositive === 'true' ? 'bg-red-600 border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600' : ''}
                />
                <Label
                  htmlFor="hivTestPositive"
                  className={`text-sm font-medium cursor-pointer ${formData.hivTestPositive === 'true' ? 'text-red-600' : 'text-slate-600'}`}
                >
                  {POSITIVE}
                </Label>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Check only if test result is <span className="font-semibold">positive/reactive</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
