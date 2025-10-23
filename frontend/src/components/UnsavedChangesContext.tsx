import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
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
      
      if (typeof pendingNavigation === 'number') {
        navigate(pendingNavigation);
      } else {
        navigate(pendingNavigation);
      }
      
      setPendingNavigation(null);
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
