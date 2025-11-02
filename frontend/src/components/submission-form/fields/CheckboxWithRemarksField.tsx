import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';
import { ERROR_MESSAGES } from '../utils/constants';

interface CheckboxItem {
  id: string;
  label: string;
}

interface CheckboxWithRemarksFieldProps {
  title: string;
  items: CheckboxItem[];
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
  clearAllButtonText?: string;
}

export function CheckboxWithRemarksField({
  title,
  items,
  value,
  onChange,
  errors = {},
  onValidate,
  clearAllButtonText = 'Clear All',
}: CheckboxWithRemarksFieldProps) {
  const handleCheckboxChange = (field: string, checked: boolean) => {
    const newValue = {
      ...value,
      [field]: checked,
    };
    
    // Clear remarks when unchecking
    if (!checked) {
      newValue[`${field}Remarks`] = '';
      // Clear error when unchecking
      if (onValidate) {
        onValidate(`${field}Remarks`, '');
      }
    }
    
    onChange(newValue);
  };

  const handleRemarksChange = (field: string, remarksValue: string) => {
    onChange({
      ...value,
      [`${field}Remarks`]: remarksValue,
    });
    
    // Clear error when user starts typing
    if (onValidate && remarksValue.trim()) {
      onValidate(`${field}Remarks`, '');
    }
  };

  const handleRemarksBlur = (field: string) => {
    if (onValidate && value[field] && !value[`${field}Remarks`]?.trim()) {
      onValidate(`${field}Remarks`, ERROR_MESSAGES.REMARKS_REQUIRED);
    }
  };

  const handleClearAll = () => {
    const clearedState: Record<string, any> = {};
    items.forEach(item => {
      clearedState[item.id] = false;
      clearedState[`${item.id}Remarks`] = '';
      
      // Clear any error for this item's remarks
      if (onValidate) {
        onValidate(`${item.id}Remarks`, '');
      }
    });
    onChange(clearedState);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {title && (
          <p className="text-sm text-gray-600">
            {title}
          </p>
        )}
        {!title && <div />}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClearAll}
        >
          {clearAllButtonText}
        </Button>
      </div>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <div className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={value[item.id] || false}
                onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
              />
              <Label
                htmlFor={item.id}
                className={`cursor-pointer text-sm leading-relaxed ${value[item.id] ? 'font-semibold' : ''}`}
              >
                {item.label}
              </Label>
            </div>
            
            {value[item.id] && (
              <div className="mt-2 ml-7">
                <Label htmlFor={`${item.id}-remarks`} className="text-sm">
                  Remarks <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id={`${item.id}-remarks`}
                  value={value[`${item.id}Remarks`] || ''}
                  onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                  onBlur={() => handleRemarksBlur(item.id)}
                  placeholder="Please provide details..."
                  className="mt-1"
                  rows={2}
                />
                {errors[`${item.id}Remarks`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`${item.id}Remarks`]}
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
