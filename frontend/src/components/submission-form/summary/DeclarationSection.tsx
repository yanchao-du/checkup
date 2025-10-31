import type { UserRole } from '../../../types/api';
import { Declaration } from './Declaration';
import { MomDeclarationContent } from './DeclarationContent';

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
  return (
    <Declaration 
      checked={checked} 
      onChange={onChange} 
      userRole={userRole}
      checkboxId="declaration"
    >
      <MomDeclarationContent />
    </Declaration>
  );
}
