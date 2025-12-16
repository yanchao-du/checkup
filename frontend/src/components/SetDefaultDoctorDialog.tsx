import { useState } from 'react';
import { usersApi, type Doctor } from '../services/users.service';
import { toast } from 'sonner';
import logger from '../utils/logger';
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
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SetDefaultDoctorDialogProps {
  open: boolean;
  doctors: Doctor[];
  onClose: () => void;
  onSave: (doctorId: string) => void;
}

export function SetDefaultDoctorDialog({ open, doctors, onClose, onSave }: SetDefaultDoctorDialogProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedDoctorId) {
      toast.warning('Please select a doctor');
      return;
    }

    try {
      setIsSaving(true);
      await usersApi.setDefaultDoctor(selectedDoctorId);
      toast.success('Default doctor set successfully');
      onSave(selectedDoctorId);
      onClose();
    } catch (error) {
      logger.error('Failed to set default doctor:', error);
      toast.error('Failed to set default doctor');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Set Default Doctor</AlertDialogTitle>
          <AlertDialogDescription>
            You haven't set a default doctor yet. Please select a doctor to route your submissions to by default.
            You can change this later in your settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 px-6 pb-4">
          <Label htmlFor="defaultDoctor">Select Default Doctor <span className="text-red-500">*</span></Label>
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger id="defaultDoctor" data-testid="defaultDoctor">
              <SelectValue placeholder="Select a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                  {doctor.mcrNumber && ` (MCR: ${doctor.mcrNumber})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            This doctor will be automatically selected when you submit for approval.
          </p>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Skip for Now</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave} disabled={!selectedDoctorId || isSaving}>
            {isSaving ? 'Saving...' : 'Save Default Doctor'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
