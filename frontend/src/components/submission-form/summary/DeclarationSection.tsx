import type { UserRole } from '../../../types/api';
import { Declaration } from './Declaration';
import { MomDeclarationContent } from './DeclarationContent';

interface DeclarationSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  userRole: UserRole;
  doctorName?: string;
  doctorMcrNumber?: string;
}

export function DeclarationSection({
  checked,
  onChange,
  userRole,
  doctorName,
  doctorMcrNumber,
}: DeclarationSectionProps) {
  return (
    <div className="space-y-4">
      {/* Doctor Information Display */}
      {doctorName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm text-blue-900 mb-2">Examining Doctor</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-24">Name:</span>
              <span className="text-gray-900">{doctorName}</span>
            </div>
            {doctorMcrNumber && (
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24">MCR Number:</span>
                <span className="text-gray-900">{doctorMcrNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Declaration 
        checked={checked} 
        onChange={onChange} 
        userRole={userRole}
        checkboxId="declaration"
      >
        <MomDeclarationContent />
      </Declaration>
    </div>
  );
}
