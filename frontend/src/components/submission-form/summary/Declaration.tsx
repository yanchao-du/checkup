import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';
import type { UserRole } from '../../../types/api';
import type { ReactNode } from 'react';

interface DeclarationProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  userRole: UserRole;
  children: ReactNode;
  checkboxId?: string;
}

export function Declaration({
  checked,
  onChange,
  userRole,
  children,
  checkboxId = 'declaration',
}: DeclarationProps) {
  if (userRole !== 'doctor') {
    return null;
  }

  return (
    <Card className="border-2 border-blue-700 bg-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Declaration</h3>
          <div className="p-4 rounded-md">
            {children}
          </div>
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id={checkboxId}
              checked={checked}
              onCheckedChange={onChange}
              className="mt-0.5 text-slate-900 bg-white"
            />
            <Label
              htmlFor={checkboxId}
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
