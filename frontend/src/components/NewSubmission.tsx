import { useState, useEffect } from 'react';
import { validateNRIC } from '../lib/nric_validator';
import { validateNricOrFin } from '../lib/validationRules';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useUnsavedChanges } from './UnsavedChangesContext';
import { submissionsApi } from '../services';
import { usersApi, type Doctor } from '../services/users.service';
import { patientsApi } from '../services/patients.service';
import type { ExamType } from '../services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
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

import { SetDefaultDoctorDialog } from './SetDefaultDoctorDialog';
import { RemarksField } from './submission-form/fields/RemarksField';
import { SixMonthlyMdwFields } from './submission-form/exam-forms/SixMonthlyMdwFields';
import { WorkPermitFields } from './submission-form/exam-forms/WorkPermitFields';
import { AgedDriversFields } from './submission-form/exam-forms/AgedDriversFields';

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
  const [nricError, setNricError] = useState<string | null>(null);
  const [patientDateOfBirth, setPatientDateOfBirth] = useState('');
  const [examinationDate, setExaminationDate] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showSetDefaultDoctorDialog, setShowSetDefaultDoctorDialog] = useState(false);
  const [isRouteForApproval, setIsRouteForApproval] = useState(false);
  const [assignedDoctorId, setAssignedDoctorId] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hasDefaultDoctor, setHasDefaultDoctor] = useState(false);
  const [isNameFromApi, setIsNameFromApi] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>('patient-info');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [lastRecordedHeight, setLastRecordedHeight] = useState<string>('');
  const [lastRecordedWeight, setLastRecordedWeight] = useState<string>('');
  const [lastRecordedDate, setLastRecordedDate] = useState<string>('');

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
          
          // Load default doctor
          const { defaultDoctorId } = await usersApi.getDefaultDoctor();
          setHasDefaultDoctor(!!defaultDoctorId);
          
          if (defaultDoctorId && !id) {
            // Only set default doctor for new submissions, not when editing drafts
            setAssignedDoctorId(defaultDoctorId);
          }
        } catch (error) {
          console.error('Failed to fetch doctors:', error);
        }
      }
    };
    fetchDoctors();
  }, [user, id]);

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
          
          // Mark sections as complete if they have valid data
          const completed = new Set<string>();
          
          // Check patient info
          if (existing.patientName && existing.patientNric && existing.examinationDate) {
            if (existing.examType !== 'AGED_DRIVERS' || existing.patientDateOfBirth) {
              completed.add('patient-info');
            }
          }
          
          // Mark other sections as complete if loading existing submission
          if (existing.formData && Object.keys(existing.formData).length > 0) {
            completed.add('exam-specific');
            completed.add('remarks');
          }
          
          setCompletedSections(completed);
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
        setIsNameFromApi(false);
        setCompletedSections(new Set());
        setActiveAccordion('patient-info');
        setLastRecordedHeight('');
        setLastRecordedWeight('');
        setLastRecordedDate('');
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

  // Reset unsaved changes when component unmounts
  useEffect(() => {
    return () => {
      setHasUnsavedChanges(false);
    };
  }, [setHasUnsavedChanges]);

  // Fetch patient name from API for SIX_MONTHLY_MDW and WORK_PERMIT
  useEffect(() => {
    const shouldFetchPatientName = 
      (examType === 'SIX_MONTHLY_MDW' || examType === 'WORK_PERMIT') &&
      patientNric.length >= 9 && 
      !nricError &&
      !id; // Only auto-fetch for new submissions, not when editing

    if (!shouldFetchPatientName) {
      return;
    }

    const fetchPatientName = async () => {
      setIsLoadingPatient(true);
      try {
        const patient = await patientsApi.getByNric(patientNric);
        if (patient) {
          setPatientName(patient.name);
          setIsNameFromApi(true);
          
          // Only store and auto-populate vitals for SIX_MONTHLY_MDW
          if (examType === 'SIX_MONTHLY_MDW') {
            // Store last recorded vitals
            setLastRecordedHeight(patient.lastHeight || '');
            setLastRecordedWeight(patient.lastWeight || '');
            setLastRecordedDate(patient.lastExamDate || '');
            
            // Auto-populate height if not already set
            if (patient.lastHeight && !formData.height) {
              setFormData(prev => ({ ...prev, height: patient.lastHeight }));
            }
          }
          
          toast.success(`Patient found: ${patient.name}`);
        } else {
          // Clear name and vitals if no patient found
          if (isNameFromApi) {
            setPatientName('');
            setIsNameFromApi(false);
            setLastRecordedHeight('');
            setLastRecordedWeight('');
            setLastRecordedDate('');
            toast.info('Patient not found in system. Please enter name manually.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch patient:', error);
        // Don't show error toast, just allow manual entry
      } finally {
        setIsLoadingPatient(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchPatientName, 500);
    return () => clearTimeout(timeoutId);
  }, [patientNric, examType, nricError, id, isNameFromApi, formData.height]);

  const handleFormDataChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleExamTypeChange = (value: string) => {
    const newExamType = value as ExamType;
    setExamType(newExamType);
    
    // Reset name-from-API flag when switching exam types
    if (newExamType === 'AGED_DRIVERS') {
      setIsNameFromApi(false);
    }
    
    // Reset completed sections and active accordion when exam type changes
    setCompletedSections(new Set());
    setActiveAccordion('patient-info');
    
    // Clear last recorded values when changing exam type
    setLastRecordedHeight('');
    setLastRecordedWeight('');
    setLastRecordedDate('');
  };

  const validatePatientInfo = (): boolean => {
    // Validate NRIC/FIN
    if (!patientNric.trim()) {
      toast.error('NRIC/FIN is required');
      return false;
    }
    
    const nricValidationError = validateNricOrFin(patientNric, validateNRIC);
    if (nricValidationError) {
      toast.error(nricValidationError);
      return false;
    }
    
    // Validate Patient Name
    if (!patientName.trim()) {
      toast.error('Patient Name is required');
      return false;
    }
    
    // Validate DOB for AGED_DRIVERS
    if (examType === 'AGED_DRIVERS' && !patientDateOfBirth) {
      toast.error('Date of Birth is required for Aged Drivers exam');
      return false;
    }
    
    // Validate Examination Date
    if (!examinationDate) {
      toast.error('Examination Date is required');
      return false;
    }
    
    return true;
  };

  const validateExamSpecific = (): boolean => {
    // Exam-specific fields are optional, so always return true
    // You can add specific validation if needed based on exam type
    return true;
  };

  const validateRemarks = (): boolean => {
    // Remarks are optional, so always return true
    return true;
  };

  const handleContinue = (currentSection: string, nextSection: string) => {
    let isValid = false;
    
    switch (currentSection) {
      case 'patient-info':
        isValid = validatePatientInfo();
        break;
      case 'exam-specific':
        isValid = validateExamSpecific();
        break;
      case 'remarks':
        isValid = validateRemarks();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      // Mark current section as completed
      setCompletedSections(prev => new Set(prev).add(currentSection));
      
      // Move to next section
      setActiveAccordion(nextSection);
      
      toast.success('Section completed');
    }
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
        ...(patientDateOfBirth && { patientDateOfBirth }), // Only include if not empty
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
      toast.warning('Please select a doctor to route this submission to');
      return;
    }

    try {
      setIsSaving(true);
      setHasUnsavedChanges(false); // Clear unsaved changes before navigation

      const submissionData = {
        examType,
        patientName,
        patientNric,
        ...(patientDateOfBirth && { patientDateOfBirth }), // Only include if not empty
        ...(examinationDate && { examinationDate }), // Only include if not empty
        formData,
        // Don't send routeForApproval: false for doctors - backend treats that as draft
        // Only send routeForApproval: true when nurse is routing for approval
        ...(user.role === 'nurse' && isRouteForApproval && { routeForApproval: true }),
        assignedDoctorId: assignedDoctorId || undefined,
      };

      if (id) {
        // Update existing submission
        await submissionsApi.update(id, submissionData);

        // Submit the draft (changes status from draft to submitted/pending_approval)
        if (user.role === 'nurse' && isRouteForApproval) {
          await submissionsApi.submitForApproval(id);
          toast.success('Routed for approval successfully');
        } else if (user.role === 'doctor') {
          // Doctor submitting directly to agency
          await submissionsApi.submitForApproval(id);
          toast.success('Medical exam submitted successfully');
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

  const isFormValid = examType && patientName && patientNric && (examType === 'AGED_DRIVERS' ? patientDateOfBirth : true);

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
          <h1 className="text-slate-900 text-2xl font-semibold">{id ? 'Edit Submission' : 'New Medical Examination'}</h1>
          <p className="text-slate-600">Complete the form to submit medical examination results</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examType" className="pt-4">Exam Type *</Label>
            <Select value={examType} onValueChange={handleExamTypeChange} name="examType">
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

          {examType && (
            <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion} className="w-full">
              <AccordionItem value="patient-info">
                <AccordionTrigger isCompleted={completedSections.has('patient-info')}>
                  <div className="flex items-center gap-2">
                    <span>Patient Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patientNric">NRIC / FIN *</Label>
                        <Input
                          id="patientNric"
                          name="nric"
                          value={patientNric}
                          onChange={(e) => setPatientNric(e.target.value)}
                          onBlur={(e) => {
                            setNricError(validateNricOrFin(e.target.value, validateNRIC));
                          }}
                          placeholder="S1234567A"
                          className={nricError ? 'border-red-500' : ''}
                        />
                        {nricError && (
                          <p className="text-xs text-red-600 mt-1">{nricError}</p>
                        )}
                      </div>
                    </div>
                    {/* Patient Name below NRIC/FIN, with conditional rendering for exam type */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name *</Label>
                      {(examType === 'SIX_MONTHLY_MDW' || examType === 'WORK_PERMIT') ? (
                        patientNric.length === 9 && !nricError ? 
                        (
                          <Input
                            id="patientName"
                            name="patientName"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder={isLoadingPatient ? "Loading..." : "Enter patient name"}
                            readOnly={isNameFromApi}
                            className={isNameFromApi ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                          />
                        ) : (
                          <Input
                            id="patientName"
                            name="patientName"
                            value=""
                            disabled
                            placeholder="Fill NRIC/FIN first"
                          />
                        )
                      ) : (
                        <Input
                          id="patientName"
                          name="patientName"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder={isLoadingPatient ? "Loading..." : "Enter patient name"}
                          readOnly={false}
                        />
                      )}
                      {/* {(examType === 'SIX_MONTHLY_MDW' || examType === 'WORK_PERMIT') && isNameFromApi && patientNric.length === 9 && !nricError && (
                        <p className="text-xs text-slate-500">Name retrieved from system based on NRIC/FIN</p>
                      )} */}
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {examType === 'AGED_DRIVERS' && (
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
                      )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="button"
                      onClick={() => handleContinue('patient-info', 'exam-specific')}
                    >
                      Continue
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="exam-specific">
                <AccordionTrigger isCompleted={completedSections.has('exam-specific')} isDisabled={!completedSections.has('patient-info')}>
                  <div className="flex items-center gap-2">
                    <span>Examination Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {examType === 'SIX_MONTHLY_MDW' && (
                    <SixMonthlyMdwFields
                      formData={formData}
                      onChange={handleFormDataChange}
                      lastRecordedHeight={lastRecordedHeight}
                      lastRecordedWeight={lastRecordedWeight}
                      lastRecordedDate={lastRecordedDate}
                    />
                  )}
                  {examType === 'WORK_PERMIT' && (
                    <WorkPermitFields
                      formData={formData}
                      onChange={handleFormDataChange}
                    />
                  )}
                  {examType === 'AGED_DRIVERS' && (
                    <AgedDriversFields
                      formData={formData}
                      onChange={handleFormDataChange}
                    />
                  )}
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="button"
                      onClick={() => {
                        if (examType === 'SIX_MONTHLY_MDW') {
                          // For MDW, mark exam-specific as complete (includes remarks)
                          if (validateExamSpecific()) {
                            setCompletedSections(prev => new Set(prev).add('exam-specific'));
                            toast.success('All sections completed! You can now save or submit.');
                          }
                        } else {
                          handleContinue('exam-specific', 'remarks');
                        }
                      }}
                    >
                      {examType === 'SIX_MONTHLY_MDW' ? 'Mark as Complete' : 'Continue'}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {examType !== 'SIX_MONTHLY_MDW' && (
                <AccordionItem value="remarks">
                  <AccordionTrigger isCompleted={completedSections.has('remarks')} isDisabled={!completedSections.has('patient-info')}>
                    <div className="flex items-center gap-2">
                      <span>Additional Remarks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <RemarksField
                      value={formData.remarks || ''}
                      onChange={(value) => handleFormDataChange('remarks', value)}
                    />
                    <div className="flex justify-end mt-4">
                      <Button 
                        type="button"
                        onClick={() => {
                          if (validateRemarks()) {
                            setCompletedSections(prev => new Set(prev).add('remarks'));
                            toast.success('All sections completed! You can now save or submit.');
                          }
                        }}
                      >
                        Mark as Complete
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleSaveDraft} disabled={!isFormValid || isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save as Draft'}
        </Button>

        <div className="flex gap-3">
          {user?.role === 'nurse' && (
            <Button 
              onClick={() => {
                // Check if default doctor is set
                if (!hasDefaultDoctor) {
                  setShowSetDefaultDoctorDialog(true);
                } else {
                  setIsRouteForApproval(true);
                  setShowSubmitDialog(true);
                }
              }}
              disabled={!isFormValid || isSaving}
            >
            <>
            <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </>
            </Button>
          )}
          
          {user?.role === 'doctor' && (<Button 
            onClick={() => {
              setIsRouteForApproval(false);
              setShowSubmitDialog(true);
            }}
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit to Agency
              </>
            )}
          </Button>)}
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
                <SelectTrigger id="assignedDoctor" data-testid="assignedDoctor">
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
                This submission will be sent to the selected doctor for approval.
              </p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="confirm-submit-button" onClick={handleSubmit}>
              {isRouteForApproval ? 'Route for Approval' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SetDefaultDoctorDialog
        open={showSetDefaultDoctorDialog}
        doctors={doctors}
        onClose={() => setShowSetDefaultDoctorDialog(false)}
        onSave={(doctorId: string) => {
          setAssignedDoctorId(doctorId);
          setHasDefaultDoctor(true);
          setShowSetDefaultDoctorDialog(false);
          setIsRouteForApproval(true);
          setShowSubmitDialog(true);
        }}
      />
    </div>
  );
}
