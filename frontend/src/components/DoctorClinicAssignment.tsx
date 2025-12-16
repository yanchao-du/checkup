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

export function DoctorClinicAssignment() {
  const [doctors, setDoctors] = useState<ClinicUser[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<ClinicUser | null>(null);
  const [doctorClinics, setDoctorClinics] = useState<Clinic[]>([]);
  const [doctorClinicCounts, setDoctorClinicCounts] = useState<Map<string, number>>(new Map());
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
      const [doctorsRes, clinicsRes] = await Promise.all([
        usersApi.getAll(1, 100),
        clinicsApi.getAll(1, 100),
      ]);
      const doctorsList = doctorsRes.data.filter(u => u.role === 'doctor');
      setDoctors(doctorsList);
      setClinics(clinicsRes.data);
      
      // Fetch clinic counts for all doctors
      const counts = new Map<string, number>();
      await Promise.all(
        doctorsList.map(async (doctor) => {
          try {
            const doctorClinics = await usersApi.getDoctorClinics(doctor.id);
            counts.set(doctor.id, doctorClinics.length);
          } catch (error) {
            logger.error(`Failed to fetch clinics for doctor ${doctor.id}:`, error);
            counts.set(doctor.id, 0);
          }
        })
      );
      setDoctorClinicCounts(counts);
    } catch (error) {
      logger.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorClinics = async (doctorId: string) => {
    try {
      setIsLoadingClinics(true);
      const clinics = await usersApi.getDoctorClinics(doctorId);
      setDoctorClinics(clinics);
      // Update the clinic count for this doctor
      setDoctorClinicCounts(prev => new Map(prev).set(doctorId, clinics.length));
    } catch (error) {
      logger.error('Failed to fetch doctor clinics:', error);
      toast.error('Failed to load doctor\'s clinics');
    } finally {
      setIsLoadingClinics(false);
    }
  };

  const handleSelectDoctor = async (doctor: ClinicUser) => {
    setSelectedDoctor(doctor);
    await fetchDoctorClinics(doctor.id);
  };

  const handleOpenAssignDialog = () => {
    setSelectedClinicId('');
    setIsPrimary(false);
    setShowAssignDialog(true);
  };

  const handleAssignClinic = async () => {
    if (!selectedDoctor || !selectedClinicId) {
      toast.warning('Please select a clinic');
      return;
    }

    try {
      setIsSaving(true);
      await usersApi.assignDoctorToClinic(selectedDoctor.id, {
        clinicId: selectedClinicId,
        isPrimary,
      });
      toast.success('Clinic assigned successfully');
      setShowAssignDialog(false);
      await fetchDoctorClinics(selectedDoctor.id);
    } catch (error: any) {
      if (error.message?.includes('already assigned')) {
        toast.error('Doctor is already assigned to this clinic');
      } else {
        toast.error(error.message || 'Failed to assign clinic');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveClinic = async (clinicId: string, clinicName: string) => {
    if (!selectedDoctor) return;

    if (!confirm(`Remove ${selectedDoctor.name} from ${clinicName}?`)) {
      return;
    }

    try {
      await usersApi.removeDoctorFromClinic(selectedDoctor.id, clinicId);
      toast.success('Clinic removed successfully');
      await fetchDoctorClinics(selectedDoctor.id);
    } catch (error: any) {
      if (error.message?.includes('at least one clinic')) {
        toast.error('Cannot remove the last clinic. Doctors must have at least one clinic assignment.');
      } else {
        toast.error(error.message || 'Failed to remove clinic');
      }
    }
  };

  const handleSetPrimary = async (clinicId: string) => {
    if (!selectedDoctor) return;

    try {
      await usersApi.setPrimaryClinic(selectedDoctor.id, clinicId);
      toast.success('Primary clinic updated');
      
      // Update the selectedDoctor state to reflect the new primary clinic
      setSelectedDoctor({
        ...selectedDoctor,
        clinicId: clinicId,
      });
      
      // Also update the doctor in the doctors array
      setDoctors(prevDoctors => 
        prevDoctors.map(d => 
          d.id === selectedDoctor.id 
            ? { ...d, clinicId: clinicId }
            : d
        )
      );
      
      await fetchDoctorClinics(selectedDoctor.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to set primary clinic');
    }
  };

  // Filter out clinics that the doctor is already assigned to
  const availableClinics = clinics.filter(
    clinic => !doctorClinics.some(dc => dc.id === clinic.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Doctor Clinic Assignments</h2>
        <p className="text-slate-600">Manage which doctors work at which clinics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Total Doctors</CardTitle>
            <UserCog className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{doctors.length}</div>
            <p className="text-xs text-slate-500 mt-1">Active doctors</p>
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
            <CardTitle className="text-sm text-slate-600">Multi-Clinic Doctors</CardTitle>
            <Building2 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {doctors.filter(d => (doctorClinicCounts.get(d.id) || 0) > 1).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Work at multiple locations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Doctors List */}
        <Card>
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>Select a doctor to manage their clinic assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-600" />
                <p className="text-sm text-slate-600">Loading doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">No doctors found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDoctor?.id === doctor.id
                        ? 'bg-blue-50 border-teal-300'
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handleSelectDoctor(doctor)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{doctor.name}</div>
                        <div className="text-sm text-slate-600">{doctor.email}</div>
                        {doctor.mcrNumber && (
                          <div className="text-xs text-slate-500 font-mono mt-1">
                            MCR: {doctor.mcrNumber}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">
                        {(() => {
                          const count = doctorClinicCounts.get(doctor.id) ?? 0;
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

        {/* Doctor's Clinics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedDoctor ? `${selectedDoctor.name}'s Clinics` : 'Clinic Assignments'}
                </CardTitle>
                <CardDescription>
                  {selectedDoctor ? 'Manage clinic assignments and primary clinic' : 'Select a doctor to view assignments'}
                </CardDescription>
              </div>
              {selectedDoctor && (
                <Button size="sm" onClick={handleOpenAssignDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedDoctor ? (
              <div className="text-center py-12">
                <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">Select a doctor to view their clinic assignments</p>
              </div>
            ) : isLoadingClinics ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-600" />
                <p className="text-sm text-slate-600">Loading clinics...</p>
              </div>
            ) : doctorClinics.length === 0 ? (
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
                {doctorClinics.map((clinic) => {
                  const isPrimary = selectedDoctor.clinicId === clinic.id;
                  return (
                    <div
                      key={clinic.id}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-slate-900">{clinic.name}</div>
                            {isPrimary && (
                              <Badge variant="default" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          {clinic.hciCode && (
                            <div className="text-xs text-slate-500 font-mono mt-1">
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
                          >
                            <Star className={`w-4 h-4 ${isPrimary ? "fill-yellow-500" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveClinic(clinic.id, clinic.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Remove clinic assignment"
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
            <DialogTitle>Assign Clinic to {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>
              Select a clinic to assign to this doctor
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
