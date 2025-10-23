import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useNavigate, NavigateFunction, useLocation } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  navigate: NavigateFunction;
  navigateWithConfirmation: (to: string | number) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Block browser back/forward buttons
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      
      // Push current state back to prevent navigation
      window.history.pushState(null, '', window.location.pathname + window.location.search);
      
      // Show our custom dialog
      setPendingNavigation(-1);
      setShowDialog(true);
    };

    // Push a state to enable popstate detection
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, location]);

  const navigateWithConfirmation = useCallback((to: string | number) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(to);
      setShowDialog(true);
    } else {
      if (typeof to === 'number') {
        navigate(to);
      } else {
        navigate(to);
      }
    }
  }, [hasUnsavedChanges, navigate]);

  const handleProceed = () => {
    if (pendingNavigation !== null) {
      setHasUnsavedChanges(false);
      setShowDialog(false);
      
      // Small delay to ensure state is cleared before navigation
      setTimeout(() => {
        if (typeof pendingNavigation === 'number') {
          navigate(pendingNavigation);
        } else {
          navigate(pendingNavigation);
        }
        setPendingNavigation(null);
      }, 0);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPendingNavigation(null);
  };

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges,
        navigate,
        navigateWithConfirmation,
      }}
    >
      {children}
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? All changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Stay on Page
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleProceed}>
              Leave and Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChanges must be used within UnsavedChangesProvider');
  }
  return context;
}
