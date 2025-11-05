import type { UserRole, UserClinic } from '../../../types/api';
import { Declaration } from './Declaration';
import { IcaDeclarationContent } from './DeclarationContent';

interface IcaDeclarationSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  userRole: UserRole;
  doctorName?: string;
  doctorMcrNumber?: string;
  clinicInfo?: UserClinic;
}

export function IcaDeclarationSection({
  checked,
  onChange,
  userRole,
  doctorName,
  doctorMcrNumber,
  clinicInfo,
}: IcaDeclarationSectionProps) {
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

      {/* Clinic Information Display */}
      {clinicInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm text-blue-900 mb-2">Clinic</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-24">Name:</span>
              <span className="text-gray-900">{clinicInfo.name}</span>
            </div>
            {clinicInfo.hciCode && (
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24">HCI Code:</span>
                <span className="text-gray-900">{clinicInfo.hciCode}</span>
              </div>
            )}
            {clinicInfo.phone && (
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24">Phone:</span>
                <span className="text-gray-900">{clinicInfo.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Declaration 
        checked={checked} 
        onChange={onChange} 
        userRole={userRole}
        checkboxId="ica-declaration"
      >
        <IcaDeclarationContent />
      </Declaration>
    </div>
  );
}
