import { Link, LinkProps } from 'react-router-dom';
import { useUnsavedChanges } from './UnsavedChangesContext';

export function ProtectedLink({ to, children, onClick, ...props }: LinkProps) {
  const { navigateWithConfirmation, hasUnsavedChanges } = useUnsavedChanges();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      navigateWithConfirmation(to as string);
    }
    
    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
