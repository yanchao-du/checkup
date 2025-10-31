import type { UserRole } from '../../../types/api';
import { Declaration } from './Declaration';

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
      <p className="text-sm text-slate-700 leading-relaxed">
        {/* TODO: Replace with actual ICA declaration text when provided */}
        <strong>Note:</strong> ICA-specific declaration text to be provided. This is a placeholder.
      </p>
      <p className="text-sm text-slate-500 italic mt-2">
        The actual declaration text for ICA medical examinations will be updated here.
      </p>
    </Declaration>
  );
}
