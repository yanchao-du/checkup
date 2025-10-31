import type { UserRole } from '../../../types/api';
import { Declaration } from './Declaration';
import { IcaDeclarationContent } from './DeclarationContent';

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
  return (
    <Declaration 
      checked={checked} 
      onChange={onChange} 
      userRole={userRole}
      checkboxId="ica-declaration"
    >
      <IcaDeclarationContent />
    </Declaration>
  );
}
