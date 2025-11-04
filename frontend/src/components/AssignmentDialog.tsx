import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, UserCheck } from 'lucide-react';
import { usersApi, type Doctor } from '../services/users.service';
import { submissionsApi } from '../services/submissions.service';
import type { MedicalSubmission, UserRole } from '../types/api';

interface AssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submission: MedicalSubmission;
  currentUserRole: UserRole;
  onAssigned: (submission: MedicalSubmission) => void;
}

export function AssignmentDialog({
  isOpen,
  onClose,
  submission,
  currentUserRole,
  onAssigned,
}: AssignmentDialogProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Doctor[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'nurse'>('doctor');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load doctors and nurses when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUserId('');
      setNote('');
      setError(null);
      // Default to opposite role for suggestions
      setSelectedRole(currentUserRole === 'doctor' ? 'nurse' : 'doctor');
    }
  }, [isOpen, currentUserRole]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const [doctorsList, nursesList] = await Promise.all([
        usersApi.getDoctors(),
        usersApi.getNurses(),
      ]);
      setDoctors(doctorsList);
      setNurses(nursesList);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load doctors and nurses. Please try again.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      setError('Please select a user to assign to');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await submissionsApi.assignSubmission(submission.id, {
        assignToId: selectedUserId,
        note: note.trim() || undefined,
      });

      onAssigned(result);
      onClose();
    } catch (err: any) {
      console.error('Failed to assign submission:', err);
      setError(err?.message || 'Failed to assign submission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableUsers = selectedRole === 'doctor' ? doctors : nurses;
  const selectedUser = availableUsers.find(u => u.id === selectedUserId);

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Submission
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="role-select">Assign to</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: 'doctor' | 'nurse') => {
                setSelectedRole(value);
                setSelectedUserId(''); // Reset selection when role changes
              }}
              disabled={isLoading || isLoadingUsers}
            >
              <SelectTrigger id="role-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-select">
              Select {selectedRole === 'doctor' ? 'Doctor' : 'Nurse'}
            </Label>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={isLoading || isLoadingUsers || availableUsers.length === 0}
              >
                <SelectTrigger id="user-select">
                  <SelectValue placeholder={`Select a ${selectedRole}...`} />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No {selectedRole}s available
                    </div>
                  ) : (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                        {user.mcrNumber && ` (MCR: ${user.mcrNumber})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-textarea">Note (optional)</Label>
            <Textarea
              id="note-textarea"
              placeholder="Add a note about this assignment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This note will be visible in the submission timeline
            </p>
          </div>

          {selectedUser && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">Assignment Summary:</p>
              <p className="mt-1 text-muted-foreground">
                <strong>{submission.patientName}</strong> will be assigned to{' '}
                <strong>{selectedUser.name}</strong> ({selectedRole})
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || !selectedUserId || isLoadingUsers}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
