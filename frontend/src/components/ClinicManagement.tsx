import { useState, useEffect } from 'react';
import { clinicsApi } from '../services/clinics.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import { Clinic } from '../types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';

export function ClinicManagement() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    hciCode: '',
    address: '',
    phone: '',
    email: '',
    registrationNumber: '',
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setIsLoading(true);
      const response = await clinicsApi.getAll(1, 100);
      setClinics(response.data);
    } catch (error) {
      console.error('Failed to fetch clinics:', error);
      toast.error('Failed to load clinics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClinic = () => {
    setEditingClinic(null);
    setFormData({
      name: '',
      hciCode: '',
      address: '',
      phone: '',
      email: '',
      registrationNumber: '',
    });
    setShowDialog(true);
  };

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      hciCode: clinic.hciCode || '',
      address: clinic.address || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      registrationNumber: clinic.registrationNumber || '',
    });
    setShowDialog(true);
  };

  const handleSaveClinic = async () => {
    if (!formData.name) {
      toast.warning('Clinic name is required');
      return;
    }

    // Validate HCI code format if provided
    if (formData.hciCode) {
      const hciRegex = /^[A-Z0-9]{7}$/;
      if (!hciRegex.test(formData.hciCode)) {
        toast.warning('HCI code must be 7 alphanumeric characters (e.g., HCI0001)');
        return;
      }
    }

    // Validate email format if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.warning('Please enter a valid email address');
        return;
      }
    }

    try {
      setIsSaving(true);

      const clinicData = {
        name: formData.name,
        ...(formData.hciCode && { hciCode: formData.hciCode }),
        ...(formData.address && { address: formData.address }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.email && { email: formData.email }),
        ...(formData.registrationNumber && { registrationNumber: formData.registrationNumber }),
      };

      if (editingClinic) {
        await clinicsApi.update(editingClinic.id, clinicData);
        toast.success('Clinic updated successfully');
      } else {
        await clinicsApi.create(clinicData);
        toast.success('Clinic created successfully');
      }

      setShowDialog(false);
      await fetchClinics();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save clinic');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClinic = async (clinicId: string, clinicName: string) => {
    if (!confirm(`Are you sure you want to delete "${clinicName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await clinicsApi.delete(clinicId);
      toast.success('Clinic deleted successfully');
      await fetchClinics();
    } catch (error: any) {
      if (error.message?.includes('existing users')) {
        toast.error('Cannot delete clinic with existing users. Please reassign or remove users first.');
      } else {
        toast.error(error.message || 'Failed to delete clinic');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Clinic Management</h2>
          <p className="text-slate-600">Manage clinic locations and information</p>
        </div>
        <Button onClick={handleAddClinic}>
          <Plus className="w-4 h-4 mr-2" />
          Add Clinic
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Total Clinics</CardTitle>
            <Building2 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{clinics.length}</div>
            <p className="text-xs text-slate-500 mt-1">Active clinic locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">With HCI Code</CardTitle>
            <Building2 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {clinics.filter(c => c.hciCode).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Registered clinics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Complete Profiles</CardTitle>
            <Building2 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {clinics.filter(c => c.hciCode && c.address && c.phone).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">With full information</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinic Locations</CardTitle>
          <CardDescription>View and manage all clinic locations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading clinics...</p>
            </div>
          ) : clinics.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 mb-4">No clinics found</p>
              <Button onClick={handleAddClinic} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Clinic
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>HCI Code</TableHead>
                    <TableHead>Registration #</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">{clinic.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {clinic.hciCode || <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {clinic.registrationNumber || <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {clinic.phone && <div>{clinic.phone}</div>}
                        {clinic.email && <div className="text-slate-500">{clinic.email}</div>}
                        {!clinic.phone && !clinic.email && <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {clinic.address || <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClinic(clinic)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClinic(clinic.id, clinic.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClinic ? 'Edit Clinic' : 'Add New Clinic'}</DialogTitle>
            <DialogDescription>
              {editingClinic
                ? 'Update clinic information and registration details'
                : 'Add a new clinic location to your network'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Clinic Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="HealthFirst Medical Clinic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hciCode">HCI Code</Label>
                <Input
                  id="hciCode"
                  value={formData.hciCode}
                  onChange={(e) => setFormData({ ...formData, hciCode: e.target.value.toUpperCase() })}
                  placeholder="HCI0001"
                  maxLength={7}
                />
                <p className="text-xs text-slate-500">7 alphanumeric characters</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="e.g., CR123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Medical Street, Singapore 123456"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+65 6123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="clinic@example.com"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClinic} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingClinic ? 'Save Changes' : 'Create Clinic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
