import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';
import type { UserRole } from '../../../types/api';

interface IcaDeclarationSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  userRole: UserRole;
}

export function IcaDeclarationSection({
  checked,
  onChange,
  userRole,
}: IcaDeclarationSectionProps) {
  if (userRole !== 'doctor') {
    return null;
  }

  return (
    <Card className="border-2 border-blue-700 bg-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Declaration</h3>
          <div className="p-4 rounded-md">
            <p className="text-sm text-slate-700 leading-relaxed">
              {/* TODO: Replace with actual ICA declaration text when provided */}
              <strong>Note:</strong> ICA-specific declaration text to be provided. This is a placeholder.
            </p>
            <p className="text-sm text-slate-500 italic mt-2">
              The actual declaration text for ICA medical examinations will be updated here.
            </p>
          </div>
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="ica-declaration"
              checked={checked}
              onCheckedChange={onChange}
              className="mt-0.5 text-slate-900 bg-white"
            />
            <Label
              htmlFor="ica-declaration"
              className="text-sm font-semibold leading-relaxed cursor-pointer text-slate-900"
            >
              I declare that all of the above is true.
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
