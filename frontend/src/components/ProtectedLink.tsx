import { Link, LinkProps, useLocation } from 'react-router-dom';
import { useUnsavedChanges } from './UnsavedChangesContext';

export function ProtectedLink({ to, children, onClick, ...props }: LinkProps) {
  const { navigateWithConfirmation, hasUnsavedChanges } = useUnsavedChanges();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetPath = typeof to === 'string' ? to : to.pathname;
    const currentPath = location.pathname;
    
    // If navigating to the same path, add a timestamp to force a refresh
    if (targetPath === currentPath && hasUnsavedChanges) {
      e.preventDefault();
      // Navigate with a state parameter to force the component to reset
      navigateWithConfirmation(`${to}?refresh=${Date.now()}`);
    } else if (hasUnsavedChanges) {
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
