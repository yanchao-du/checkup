import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useUnsavedChanges } from './UnsavedChangesContext';
import { submissionsApi } from '../services';
import { usersApi, type Doctor } from '../services/users.service';
import type { ExamType } from '../services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
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

const examTypes: { value: ExamType; label: string }[] = [
  { value: 'SIX_MONTHLY_MDW', label: 'Six-monthly Medical Exam for Migrant Domestic Workers (MOM)' },
  { value: 'WORK_PERMIT', label: 'Full Medical Exam for Work Permit (MOM)' },
  { value: 'AGED_DRIVERS', label: 'Medical Exam for Aged Drivers (SPF)' },
];

export function NewSubmission() {
  const { id } = useParams();
  const { user } = useAuth();
  const { hasUnsavedChanges, setHasUnsavedChanges, navigate, navigateWithConfirmation } = useUnsavedChanges();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [examType, setExamType] = useState<ExamType | ''>('');
  const [patientName, setPatientName] = useState('');
  const [patientNric, setPatientNric] = useState('');
  const [patientDateOfBirth, setPatientDateOfBirth] = useState('');
  const [examinationDate, setExaminationDate] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isRouteForApproval, setIsRouteForApproval] = useState(false);
  const [assignedDoctorId, setAssignedDoctorId] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Block browser navigation (refresh, close tab, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load doctors list for nurse
  useEffect(() => {
    const fetchDoctors = async () => {
      if (user?.role === 'nurse') {
        try {
          const doctorsList = await usersApi.getDoctors();
          setDoctors(doctorsList);
        } catch (error) {
          console.error('Failed to fetch doctors:', error);
        }
      }
    };
    fetchDoctors();
  }, [user]);

  useEffect(() => {
    const loadSubmission = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const existing = await submissionsApi.getById(id);
          setExamType(existing.examType);
          setPatientName(existing.patientName);
          setPatientNric(existing.patientNric);
          setPatientDateOfBirth(existing.patientDateOfBirth);
          setExaminationDate(existing.examinationDate || '');
          setAssignedDoctorId(existing.assignedDoctorId || '');
          setFormData(existing.formData);
        } catch (error) {
          console.error('Failed to load submission:', error);
          toast.error('Failed to load submission');
          navigate('/drafts');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset form when creating new submission (no id)
        setExamType('');
        setPatientName('');
        setPatientNric('');
        setPatientDateOfBirth('');
        setExaminationDate('');
        setAssignedDoctorId('');
        setFormData({});
      }
    };

    loadSubmission();
  }, [id, navigate]);

  // Track form changes
  useEffect(() => {
    // Mark as changed if any field has data (for new submissions) or if editing an existing draft
    const hasData = !!(examType || patientName || patientNric || patientDateOfBirth || 
                    examinationDate || Object.keys(formData).length > 0);
    setHasUnsavedChanges(hasData);
  }, [examType, patientName, patientNric, patientDateOfBirth, examinationDate, formData, setHasUnsavedChanges]);

  const handleFormDataChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = async () => {
    if (!examType || !user) return;

    try {
      setIsSaving(true);
      setHasUnsavedChanges(false); // Clear unsaved changes before navigation

      const submissionData = {
        examType,
        patientName,
        patientNric,
        patientDateOfBirth,
        ...(examinationDate && { examinationDate }), // Only include if not empty
        formData,
        routeForApproval: false,
        assignedDoctorId: assignedDoctorId || undefined,
      };

      if (id) {
        // Update existing draft
        await submissionsApi.update(id, submissionData);
        toast.success('Draft updated successfully');
        navigate('/drafts', { replace: true });
      } else {
        // Create new draft
        await submissionsApi.create(submissionData);
        toast.success('Draft saved successfully');
        navigate('/drafts', { replace: true });
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
      setHasUnsavedChanges(true); // Restore unsaved changes flag on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!examType || !user) return;

    // For nurses routing for approval, require a doctor to be selected
    if (user.role === 'nurse' && isRouteForApproval && !assignedDoctorId) {
      toast.error('Please select a doctor to route this submission to');
      return;
    }

    try {
      setIsSaving(true);
      setHasUnsavedChanges(false); // Clear unsaved changes before navigation

      const submissionData = {
        examType,
        patientName,
        patientNric,
        patientDateOfBirth,
        ...(examinationDate && { examinationDate }), // Only include if not empty
        formData,
        routeForApproval: user.role === 'nurse' && isRouteForApproval,
        assignedDoctorId: assignedDoctorId || undefined,
      };

      if (id) {
        // Update existing submission
        await submissionsApi.update(id, submissionData);

        // If nurse and routing for approval
        if (user.role === 'nurse' && isRouteForApproval) {
          await submissionsApi.submitForApproval(id);
          toast.success('Routed for approval successfully');
        } else {
          toast.success('Submission updated successfully');
        }
        navigate('/submissions', { replace: true });
      } else {
        // Create new submission
        await submissionsApi.create(submissionData);

        if (user.role === 'doctor' || !isRouteForApproval) {
          toast.success('Medical exam submitted successfully');
        } else {
          toast.success('Routed for approval successfully');
        }
        navigate('/submissions', { replace: true });
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to submit medical exam');
      setHasUnsavedChanges(true); // Restore unsaved changes flag on error
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = examType && patientName && patientNric && patientDateOfBirth;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateWithConfirmation(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-slate-900">{id ? 'Edit Submission' : 'New Medical Examination'}</h1>
          <p className="text-slate-600">Complete the form to submit medical examination results</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Enter patient details and exam type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examType">Exam Type *</Label>
            <Select value={examType} onValueChange={(value: string) => setExamType(value as ExamType)} name="examType">
              <SelectTrigger id="examType" data-testid="examType">
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                name="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientNric">NRIC / FIN *</Label>
              <Input
                id="patientNric"
                name="nric"
                value={patientNric}
                onChange={(e) => setPatientNric(e.target.value)}
                placeholder="S1234567A"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              name="dateOfBirth"
              type="date"
              value={patientDateOfBirth}
              onChange={(e) => setPatientDateOfBirth(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examinationDate">Examination Date *</Label>
            <Input
              id="examinationDate"
              name="examinationDate"
              type="date"
              value={examinationDate}
              onChange={(e) => setExaminationDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {examType && (
        <Card>
          <CardHeader>
            <CardTitle>Medical Examination Details</CardTitle>
            <CardDescription>
              {examTypes.find(t => t.value === examType)?.label || examType}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Common fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => handleFormDataChange('height', e.target.value)}
                  placeholder="170"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => handleFormDataChange('weight', e.target.value)}
                  placeholder="70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  name="bloodPressure"
                  value={formData.bloodPressure || ''}
                  onChange={(e) => handleFormDataChange('bloodPressure', e.target.value)}
                  placeholder="120/80"
                />
              </div>
            </div>

            {/* Exam type specific fields */}
            {examType === 'SIX_MONTHLY_MDW' && (
              <>
                <div className="space-y-2">
                  <Label>Pregnancy Test</Label>
                  <RadioGroup
                    value={formData.pregnancyTest || ''}
                    onValueChange={(value: string) => handleFormDataChange('pregnancyTest', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Positive" id="preg-pos" />
                      <Label htmlFor="preg-pos">Positive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Negative" id="preg-neg" />
                      <Label htmlFor="preg-neg">Negative</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="N/A" id="preg-na" />
                      <Label htmlFor="preg-na">N/A</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chestXray">Chest X-Ray Result</Label>
                  <Input
                    id="chestXray"
                    value={formData.chestXray || ''}
                    onChange={(e) => handleFormDataChange('chestXray', e.target.value)}
                    placeholder="Normal / Abnormal findings"
                  />
                </div>
              </>
            )}

            {examType === 'WORK_PERMIT' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="hivTest">HIV Test Result</Label>
                  <Select
                    value={formData.hivTest || ''}
                    onValueChange={(value: string) => handleFormDataChange('hivTest', value)}
                  >
                    <SelectTrigger id="hivTest">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="Positive">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tbTest">TB Test Result</Label>
                  <Select
                    value={formData.tbTest || ''}
                    onValueChange={(value: string) => handleFormDataChange('tbTest', value)}
                  >
                    <SelectTrigger id="tbTest">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="Positive">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {examType === 'AGED_DRIVERS' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="visualAcuity">Visual Acuity</Label>
                  <Input
                    id="visualAcuity"
                    value={formData.visualAcuity || ''}
                    onChange={(e) => handleFormDataChange('visualAcuity', e.target.value)}
                    placeholder="6/6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hearingTest">Hearing Test</Label>
                  <Input
                    id="hearingTest"
                    value={formData.hearingTest || ''}
                    onChange={(e) => handleFormDataChange('hearingTest', e.target.value)}
                    placeholder="Normal / Impaired"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Diabetes</Label>
                  <RadioGroup
                    value={formData.diabetes || ''}
                    onValueChange={(value: string) => handleFormDataChange('diabetes', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="diabetes-yes" />
                      <Label htmlFor="diabetes-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="diabetes-no" />
                      <Label htmlFor="diabetes-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="remarks">Additional Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks || ''}
                onChange={(e) => handleFormDataChange('remarks', e.target.value)}
                placeholder="Enter any additional medical findings or notes"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleSaveDraft} disabled={!isFormValid || isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save as Draft'}
        </Button>

        <div className="flex gap-3">
          {user?.role === 'nurse' && (
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRouteForApproval(true);
                setShowSubmitDialog(true);
              }}
              disabled={!isFormValid || isSaving}
            >
              Submit for Approval
            </Button>
          )}
          
          <Button 
            onClick={() => {
              setIsRouteForApproval(false);
              setShowSubmitDialog(true);
            }}
            disabled={!isFormValid || isSaving || (user?.role === 'nurse' && !id)}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {user?.role === 'doctor' ? 'Submit to Agency' : 'Submit'}
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRouteForApproval ? 'Route for Approval?' : 'Submit Medical Exam?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRouteForApproval 
                ? 'This will send the medical exam to a doctor for review and approval before submission.'
                : user?.role === 'doctor'
                ? 'This will submit the medical exam results to the relevant government agency. This action cannot be undone.'
                : 'This will submit the medical exam results. Please ensure all information is accurate.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {user?.role === 'nurse' && isRouteForApproval && (
            <div className="space-y-2 px-6 pb-4">
              <Label htmlFor="assignedDoctor">Assign to Doctor *</Label>
              <Select value={assignedDoctorId} onValueChange={setAssignedDoctorId}>
                <SelectTrigger id="assignedDoctor">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                This submission will be sent to the selected doctor for approval.
              </p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              {isRouteForApproval ? 'Route for Approval' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
