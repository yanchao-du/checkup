import { useState, useEffect } from 'react';
import { usersApi, type Doctor } from '../services/users.service';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, Users, Building2, UserCog } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { ClinicManagement } from './ClinicManagement';
import { DoctorClinicAssignment } from './DoctorClinicAssignment';
import { NurseClinicAssignment } from './NurseClinicAssignment';

export function Settings() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [currentDefaultDoctorId, setCurrentDefaultDoctorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Default to 'users' tab for admin, 'settings' for others
  const [activeTab, setActiveTab] = useState<'users' | 'clinics' | 'doctor-assignments' | 'nurse-assignments' | 'settings'>('users');

  // Set the correct default tab based on user role
  useEffect(() => {
    if (user?.role === 'admin') {
      setActiveTab('users');
    }
  }, [user?.role]);

  useEffect(() => {
    const loadData = async () => {
      if (user?.role !== 'nurse') return;

      try {
        setIsLoading(true);
        
        // Load doctors list
        const doctorsList = await usersApi.getDoctors();
        setDoctors(doctorsList);

        // Load current default doctor
        const { defaultDoctorId } = await usersApi.getDefaultDoctor();
        setCurrentDefaultDoctorId(defaultDoctorId);
        setSelectedDoctorId(defaultDoctorId || '');
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!selectedDoctorId) {
      toast.warning('Please select a doctor');
      return;
    }

    try {
      setIsSaving(true);
      await usersApi.setDefaultDoctor(selectedDoctorId);
      setCurrentDefaultDoctorId(selectedDoctorId);
      toast.success('Default doctor updated successfully');
    } catch (error) {
      console.error('Failed to update default doctor:', error);
      toast.error('Failed to update default doctor');
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== 'nurse' && user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-600" />
          <div>
            <h1 className="text-slate-900">Settings</h1>
            <p className="text-slate-600">No settings available for your role</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin role - show management tabs
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
            <p className="text-slate-600">Manage users, clinics, and assignments</p>
          </div>
        </div> */}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('clinics')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'clinics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Clinic Management
            </button>
            <button
              onClick={() => setActiveTab('doctor-assignments')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'doctor-assignments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCog className="w-4 h-4 inline mr-2" />
              Doctor Assignments
            </button>
            <button
              onClick={() => setActiveTab('nurse-assignments')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'nurse-assignments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCog className="w-4 h-4 inline mr-2" />
              Nurse Assignments
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'clinics' && <ClinicManagement />}
          {activeTab === 'doctor-assignments' && <DoctorClinicAssignment />}
          {activeTab === 'nurse-assignments' && <NurseClinicAssignment />}
        </div>
      </div>
    );
  }

  // Nurse role - show default doctor settings
  if (user?.role !== 'nurse') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-600" />
          <div>
            <h1 className="text-slate-900">Settings</h1>
            <p className="text-slate-600">Settings are only available for nurses</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const hasChanges = selectedDoctorId !== (currentDefaultDoctorId || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-slate-600" />
        <div>
          <h1 className="text-slate-900">Settings</h1>
          <p className="text-slate-600">Manage your preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Doctor</CardTitle>
          <CardDescription>
            Set your default doctor for routing submissions for approval. This doctor will be automatically
            selected when you submit a new medical examination for approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultDoctor">Default Doctor</Label>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger id="defaultDoctor" data-testid="settings-defaultDoctor">
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
            {currentDefaultDoctorId && (
              <p className="text-xs text-slate-500">
                Current default: {doctors.find(d => d.id === currentDefaultDoctorId)?.name || 'Unknown'}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || !selectedDoctorId || isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {!currentDefaultDoctorId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> You haven't set a default doctor yet. When you click "Submit for Approval"
                on a new submission, you'll be prompted to select one.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
