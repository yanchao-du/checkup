import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useMockData, ExamType } from './useMockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, Save, Send } from 'lucide-react';
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

const examTypes: ExamType[] = [
  'Six-monthly Medical Exam for Migrant Domestic Workers (MOM)',
  'Full Medical Exam for Work Permit (MOM)',
  'Medical Exam for Aged Drivers (SPF)',
];

export function NewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveSubmission, getSubmissionById } = useMockData();

  const [examType, setExamType] = useState<ExamType | ''>('');
  const [patientName, setPatientName] = useState('');
  const [patientNric, setPatientNric] = useState('');
  const [patientDateOfBirth, setPatientDateOfBirth] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isRouteForApproval, setIsRouteForApproval] = useState(false);

  useEffect(() => {
    if (id) {
      const existing = getSubmissionById(id);
      if (existing) {
        setExamType(existing.examType);
        setPatientName(existing.patientName);
        setPatientNric(existing.patientNric);
        setPatientDateOfBirth(existing.patientDateOfBirth);
        setFormData(existing.formData);
      }
    }
  }, [id, getSubmissionById]);

  const handleFormDataChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    const submission = {
      id: id || `draft-${Date.now()}`,
      examType: examType as ExamType,
      patientName,
      patientNric,
      patientDateOfBirth,
      status: 'draft' as const,
      createdBy: user!.id,
      createdByName: user!.name,
      createdDate: new Date().toISOString(),
      clinicId: user!.clinicId,
      formData,
    };

    saveSubmission(submission);
    toast.success('Draft saved successfully');
    navigate('/drafts');
  };

  const handleSubmit = () => {
    const submission = {
      id: id || `sub-${Date.now()}`,
      examType: examType as ExamType,
      patientName,
      patientNric,
      patientDateOfBirth,
      status: (user?.role === 'doctor' || !isRouteForApproval ? 'submitted' : 'pending_approval') as const,
      createdBy: user!.id,
      createdByName: user!.name,
      createdDate: id ? getSubmissionById(id)?.createdDate || new Date().toISOString() : new Date().toISOString(),
      submittedDate: user?.role === 'doctor' || !isRouteForApproval ? new Date().toISOString() : undefined,
      approvedBy: user?.role === 'doctor' || !isRouteForApproval ? user!.id : undefined,
      approvedByName: user?.role === 'doctor' || !isRouteForApproval ? user!.name : undefined,
      approvedDate: user?.role === 'doctor' || !isRouteForApproval ? new Date().toISOString() : undefined,
      clinicId: user!.clinicId,
      formData,
    };

    saveSubmission(submission);
    
    if (user?.role === 'doctor' || !isRouteForApproval) {
      toast.success('Medical exam submitted successfully');
    } else {
      toast.success('Routed for approval successfully');
    }
    
    navigate('/submissions');
  };

  const isFormValid = examType && patientName && patientNric && patientDateOfBirth;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-slate-900">{id ? 'Edit Submission' : 'New Medical Exam Submission'}</h2>
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
            <Select value={examType} onValueChange={(value) => setExamType(value as ExamType)}>
              <SelectTrigger id="examType">
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
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
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientNric">NRIC / FIN *</Label>
              <Input
                id="patientNric"
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
              type="date"
              value={patientDateOfBirth}
              onChange={(e) => setPatientDateOfBirth(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {examType && (
        <Card>
          <CardHeader>
            <CardTitle>Medical Examination Details</CardTitle>
            <CardDescription>{examType}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Common fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
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
                  value={formData.bloodPressure || ''}
                  onChange={(e) => handleFormDataChange('bloodPressure', e.target.value)}
                  placeholder="120/80"
                />
              </div>
            </div>

            {/* Exam type specific fields */}
            {examType.includes('Migrant Domestic Workers') && (
              <>
                <div className="space-y-2">
                  <Label>Pregnancy Test</Label>
                  <RadioGroup
                    value={formData.pregnancyTest || ''}
                    onValueChange={(value) => handleFormDataChange('pregnancyTest', value)}
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

            {examType.includes('Work Permit') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="hivTest">HIV Test Result</Label>
                  <Select
                    value={formData.hivTest || ''}
                    onValueChange={(value) => handleFormDataChange('hivTest', value)}
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
                    onValueChange={(value) => handleFormDataChange('tbTest', value)}
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

            {examType.includes('Aged Drivers') && (
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
                    onValueChange={(value) => handleFormDataChange('diabetes', value)}
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
        <Button variant="outline" onClick={handleSaveDraft} disabled={!isFormValid}>
          <Save className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>

        <div className="flex gap-3">
          {user?.role === 'nurse' && (
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRouteForApproval(true);
                setShowSubmitDialog(true);
              }}
              disabled={!isFormValid}
            >
              Route for Approval
            </Button>
          )}
          
          <Button 
            onClick={() => {
              setIsRouteForApproval(false);
              setShowSubmitDialog(true);
            }}
            disabled={!isFormValid || (user?.role === 'nurse' && !id)}
          >
            <Send className="w-4 h-4 mr-2" />
            {user?.role === 'doctor' ? 'Submit to Agency' : 'Submit'}
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
