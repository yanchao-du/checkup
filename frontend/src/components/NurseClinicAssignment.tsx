import { useState, useEffect } from 'react';
import { usersApi } from '../services/users.service';
import { clinicsApi } from '../services/clinics.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, UserCog, Building2, Star, Plus, X } from 'lucide-react';
import { ClinicUser, Clinic } from '../types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import logger from '../utils/logger';

export function NurseClinicAssignment() {
  const [nurses, setNurses] = useState<ClinicUser[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<ClinicUser | null>(null);
  const [nurseClinics, setNurseClinics] = useState<Clinic[]>([]);
  const [nurseClinicCounts, setNurseClinicCounts] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, clinicsRes] = await Promise.all([
        usersApi.getAll(1, 100),
        clinicsApi.getAll(1, 100),
      ]);
      const nursesList = usersRes.data.filter(u => u.role === 'nurse');
      setNurses(nursesList);
      setClinics(clinicsRes.data);
      
      // Fetch clinic counts for all nurses
      const counts = new Map<string, number>();
      await Promise.all(
        nursesList.map(async (nurse) => {
          try {
            const nurseClinics = await usersApi.getNurseClinics(nurse.id);
            counts.set(nurse.id, nurseClinics.length);
          } catch (error) {
            logger.error(`Failed to fetch clinics for nurse ${nurse.id}:`, error);
            counts.set(nurse.id, 0);
          }
        })
      );
      setNurseClinicCounts(counts);
    } catch (error) {
      logger.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNurseClinics = async (nurseId: string) => {
    try {
      setIsLoadingClinics(true);
      const clinics = await usersApi.getNurseClinics(nurseId);
      setNurseClinics(clinics);
      // Update the clinic count for this nurse
      setNurseClinicCounts(prev => new Map(prev).set(nurseId, clinics.length));
    } catch (error) {
      logger.error('Failed to fetch nurse clinics:', error);
      toast.error('Failed to load nurse\'s clinics');
    } finally {
      setIsLoadingClinics(false);
    }
  };

  const handleSelectNurse = async (nurse: ClinicUser) => {
    setSelectedNurse(nurse);
    await fetchNurseClinics(nurse.id);
  };

  const handleOpenAssignDialog = () => {
    setSelectedClinicId('');
    setIsPrimary(false);
    setShowAssignDialog(true);
  };

  const handleAssignClinic = async () => {
    if (!selectedNurse || !selectedClinicId) {
      toast.warning('Please select a clinic');
      return;
    }

    try {
      setIsSaving(true);
      await usersApi.assignNurseToClinic(selectedNurse.id, {
        clinicId: selectedClinicId,
        isPrimary,
      });
      toast.success('Clinic assigned successfully');
      setShowAssignDialog(false);
      await fetchNurseClinics(selectedNurse.id);
    } catch (error: any) {
      if (error.message?.includes('already assigned')) {
        toast.error('Nurse is already assigned to this clinic');
      } else {
        toast.error(error.message || 'Failed to assign clinic');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveClinic = async (clinicId: string, clinicName: string) => {
    if (!selectedNurse) return;

    if (!confirm(`Remove ${selectedNurse.name} from ${clinicName}?`)) {
      return;
    }

    try {
      await usersApi.removeNurseFromClinic(selectedNurse.id, clinicId);
      toast.success('Clinic removed successfully');
      await fetchNurseClinics(selectedNurse.id);
    } catch (error: any) {
      if (error.message?.includes('at least one clinic')) {
        toast.error('Cannot remove the last clinic. Nurses must have at least one clinic assignment.');
      } else {
        toast.error(error.message || 'Failed to remove clinic');
      }
    }
  };

  const handleSetPrimary = async (clinicId: string) => {
    if (!selectedNurse) return;

    try {
      await usersApi.setNursePrimaryClinic(selectedNurse.id, clinicId);
      toast.success('Primary clinic updated');
      
      // Update the selectedNurse state to reflect the new primary clinic
      setSelectedNurse({
        ...selectedNurse,
        clinicId: clinicId,
      });
      
      // Also update the nurse in the nurses array
      setNurses(prevNurses => 
        prevNurses.map(n => 
          n.id === selectedNurse.id 
            ? { ...n, clinicId: clinicId }
            : n
        )
      );
      
      await fetchNurseClinics(selectedNurse.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to set primary clinic');
    }
  };

  // Filter out clinics that the nurse is already assigned to
  const availableClinics = clinics.filter(
    clinic => !nurseClinics.some(nc => nc.id === clinic.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Nurse Clinic Assignments</h2>
        <p className="text-slate-600">Manage which nurses work at which clinics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Total Nurses</CardTitle>
            <UserCog className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{nurses.length}</div>
            <p className="text-xs text-slate-500 mt-1">Active nurses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Total Clinics</CardTitle>
            <Building2 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{clinics.length}</div>
            <p className="text-xs text-slate-500 mt-1">Clinic locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Multi-Clinic Nurses</CardTitle>
            <Building2 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {nurses.filter(n => (nurseClinicCounts.get(n.id) || 0) > 1).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Work at multiple locations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Nurses List */}
        <Card>
          <CardHeader>
            <CardTitle>Nurses</CardTitle>
            <CardDescription>Select a nurse to manage their clinic assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-600" />
                <p className="text-sm text-slate-600">Loading nurses...</p>
              </div>
            ) : nurses.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">No nurses found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {nurses.map((nurse) => (
                  <div
                    key={nurse.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedNurse?.id === nurse.id
                        ? 'bg-blue-50 border-teal-300'
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handleSelectNurse(nurse)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{nurse.name}</div>
                        <div className="text-sm text-slate-600">{nurse.email}</div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {(() => {
                          const count = nurseClinicCounts.get(nurse.id) ?? 0;
                          return count === 1 ? '1 clinic' : `${count} clinics`;
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nurse's Clinics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedNurse ? `${selectedNurse.name}'s Clinics` : 'Clinic Assignments'}
                </CardTitle>
                <CardDescription>
                  {selectedNurse ? 'Manage clinic assignments and primary clinic' : 'Select a nurse to view assignments'}
                </CardDescription>
              </div>
              {selectedNurse && (
                <Button size="sm" onClick={handleOpenAssignDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedNurse ? (
              <div className="text-center py-12">
                <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">Select a nurse to view their clinic assignments</p>
              </div>
            ) : isLoadingClinics ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-600" />
                <p className="text-sm text-slate-600">Loading clinics...</p>
              </div>
            ) : nurseClinics.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600 mb-3">No clinic assignments</p>
                <Button size="sm" variant="outline" onClick={handleOpenAssignDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign First Clinic
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {nurseClinics.map((clinic) => {
                  const isPrimary = selectedNurse.clinicId === clinic.id;
                  return (
                    <div
                      key={clinic.id}
                      className="p-3 border rounded-lg"
                      data-testid="clinic-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-slate-900" data-testid="clinic-name">
                              {clinic.name}
                            </div>
                            {isPrimary && (
                              <Badge variant="default" className="text-xs" data-testid="primary-badge">
                                <Star className="w-3 h-3 mr-1" data-testid="primary-star-icon" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          {clinic.hciCode && (
                            <div className="text-xs text-slate-500 font-mono mt-1" data-testid="clinic-hci">
                              HCI: {clinic.hciCode}
                            </div>
                          )}
                          {clinic.address && (
                            <div className="text-sm text-slate-600 mt-1">{clinic.address}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => !isPrimary && handleSetPrimary(clinic.id)}
                            title={isPrimary ? "Primary clinic" : "Set as primary clinic"}
                            className={isPrimary 
                              ? "text-yellow-500 hover:text-yellow-500 cursor-default hover:bg-transparent" 
                              : "text-slate-400 hover:text-yellow-500 hover:bg-slate-100"
                            }
                            data-testid="set-primary-btn"
                          >
                            <Star className={`w-4 h-4 ${isPrimary ? "fill-yellow-500" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveClinic(clinic.id, clinic.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Remove clinic assignment"
                            data-testid="remove-clinic-btn"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Clinic Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Clinic to {selectedNurse?.name}</DialogTitle>
            <DialogDescription>
              Select a clinic to assign to this nurse
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clinic">Clinic</Label>
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                <SelectTrigger id="clinic">
                  <SelectValue placeholder="Select a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {availableClinics.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500">
                      No available clinics (already assigned to all)
                    </div>
                  ) : (
                    availableClinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name} {clinic.hciCode && `(${clinic.hciCode})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-slate-300"
              />
              <Label htmlFor="isPrimary" className="font-normal">
                Set as primary clinic
              </Label>
            </div>
            {isPrimary && (
              <p className="text-xs text-slate-500">
                This will replace the current primary clinic designation
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignClinic} 
              disabled={isSaving || !selectedClinicId || availableClinics.length === 0}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign Clinic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
