import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';
import type { UserRole } from '../../../types/api';

interface DeclarationSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  userRole: UserRole;
}

export function DeclarationSection({
  checked,
  onChange,
  userRole,
}: DeclarationSectionProps) {
  if (userRole !== 'doctor') {
    return null;
  }

  return (
    <Card className="border-2 border-blue-70 bg-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Declaration</h3>
          <div className="p-4 rounded-md">
            <p className="text-sm text-slate-700 leading-relaxed">
              Please read and acknowledge the following:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li className="text-sm text-slate-700 leading-relaxed">I am authorised by the clinic to submit the results and make the declarations in this form on its behalf.</li>
              <li className="text-sm text-slate-700 leading-relaxed">By submitting this form, I understand that the information given will be submitted to the Controller or an authorised officer who may act on the information given by me. I further declare that the information provided by me is true to the best of my knowledge and belief.</li>
            </ul>
          </div>
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="declaration"
              checked={checked}
              onCheckedChange={onChange}
              // size="lg"
              className="mt-0.5 text-slate-900 bg-white"
            />
            <Label
              htmlFor="declaration"
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
