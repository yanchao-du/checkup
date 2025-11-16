import { useState, useEffect, useRef } from 'react';
import { validateNRIC } from '../lib/nric_validator';
import { validateNricOrFin, validateEmail, validateSingaporeMobile, validatePatientName, validatePassportNo } from '../lib/validationRules';
import { validateDrivingLicenceExamTiming } from '../lib/drivingLicenceValidation';
import { calculateAge, formatAge } from '../lib/ageCalculation';
import { getTodayInSingapore } from './submission-form/utils/date';
import { maskName } from '../lib/nameMasking';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useUnsavedChanges } from './UnsavedChangesContext';
import { submissionsApi } from '../services';
import { usersApi, type Doctor } from '../services/users.service';
import { patientsApi } from '../services/patients.service';
import type { ExamType, UserClinic, SubmissionStatus } from '../services';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { InlineError } from './ui/InlineError';
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { toast } from 'sonner';
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

import { SetDefaultDoctorDialog } from './SetDefaultDoctorDialog';
import { RemarksField } from './submission-form/fields/RemarksField';
import { DateOfBirthField } from './submission-form/fields/DateOfBirthField';
import { DrivingLicenceClassField } from './submission-form/fields/DrivingLicenceClassField';
import { SixMonthlyMdwFields } from './submission-form/exam-forms/SixMonthlyMdwFields';
import { SixMonthlyFmwFields } from './submission-form/exam-forms/SixMonthlyFmwFields';
import { WorkPermitFields } from './submission-form/exam-forms/WorkPermitFields';
import { AgedDriversFields } from './submission-form/exam-forms/AgedDriversFields';
import { SixMonthlyMdwSummary } from './submission-form/summary/SixMonthlyMdwSummary';
import { SixMonthlyFmwSummary } from './submission-form/summary/SixMonthlyFmwSummary';
import { DrivingLicenceTpSummary } from './submission-form/summary/DrivingLicenceTpSummary';
import { DrivingVocationalTpLtaSummary } from './submission-form/summary/DrivingVocationalTpLtaSummary';
import { VocationalLicenceLtaSummary } from './submission-form/summary/VocationalLicenceLtaSummary';
import { ShortDriverExamSummary } from './submission-form/summary/ShortDriverExamSummary';
import { DeclarationSection } from './submission-form/summary/DeclarationSection';
import { IcaDeclarationSection } from './submission-form/summary/IcaDeclarationSection';
import { IcaExamFields } from './submission-form/exam-forms/IcaExamFields';
import { IcaExamSummary } from './submission-form/summary/IcaExamSummary';
import { DrivingLicenceTpAccordions } from './submission-form/accordions/DrivingLicenceTpAccordions';
import { DrivingVocationalTpLtaAccordions } from './submission-form/accordions/DrivingVocationalTpLtaAccordions';
import { VocationalLicenceLtaAccordions } from './submission-form/accordions/VocationalLicenceLtaAccordions';
import { DrivingVocationalTpLtaShortAccordions } from './submission-form/accordions/DrivingVocationalTpLtaShortAccordions';
import { FullMedicalExamFields } from './FullMedicalExamFields';
import { FullMedicalExamSummary } from './FullMedicalExamSummary';
import { useSubmissionWorkflow } from '../hooks/useSubmissionWorkflow';

// Helper to check if exam type is ICA
const isIcaExamType = (examType: ExamType | ''): boolean => {
  return examType === 'PR_MEDICAL' || examType === 'STUDENT_PASS_MEDICAL' || examType === 'LTVP_MEDICAL';
};

// Helper to check if exam type is a driver medical exam
const isDriverExamType = (examType: ExamType | ''): boolean => {
  return examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA' || examType === 'VOCATIONAL_LICENCE_LTA';
};

// Helper to check if exam type is a short driver medical exam
const isShortDriverExamType = (examType: ExamType | ''): boolean => {
  return examType === 'DRIVING_LICENCE_TP_SHORT' || examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT';
};

// Helper to check if exam type is a MOM exam
const isMomExamType = (examType: ExamType | ''): boolean => {
  return examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'FULL_MEDICAL_EXAM';
};

// Helper to check if there are pending memos for TP_LTA exam
const hasPendingMemos = (examType: ExamType | '', formData: Record<string, any>): boolean => {
  if (examType !== 'DRIVING_VOCATIONAL_TP_LTA') return false;
  
  const memoRequirements = formData.memoRequirements 
    ? (typeof formData.memoRequirements === 'string' 
        ? JSON.parse(formData.memoRequirements) 
        : formData.memoRequirements)
    : {};
  
  const checkedConditions = Object.entries(memoRequirements)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);
  
  // Check each checked condition for pending memos
  for (const conditionId of checkedConditions) {
    const memoProvided = formData[`memoProvided_${conditionId}`];
    const furtherMemoRequired = formData[`furtherMemoRequired_${conditionId}`];
    
    // Memo is pending if:
    // 1. Patient has not provided memo (answered "no")
    // 2. Patient provided memo but further memo is required (answered "yes" to further memo)
    if (memoProvided === 'no' || (memoProvided === 'yes' && furtherMemoRequired === 'yes')) {
      return true;
    }
  }
  
  return false;
};

export function NewSubmission() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role || 'nurse';
  const { hasUnsavedChanges, setHasUnsavedChanges, navigate, navigateWithConfirmation } = useUnsavedChanges();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [examType, setExamType] = useState<ExamType | ''>('');
  const [patientName, setPatientName] = useState('');
  const [patientNric, setPatientNric] = useState('');
  const [patientPassportNo, setPatientPassportNo] = useState('');
  const [nricError, setNricError] = useState<string | null>(null);
  const [passportNoError, setPassportNoError] = useState<string | null>(null);
  const [patientNameError, setPatientNameError] = useState<string | null>(null);
  const [patientDateOfBirth, setPatientDateOfBirth] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [medicalDeclarationRemarksError, setMedicalDeclarationRemarksError] = useState<string | null>(null);
  const [medicalDeclarationPatientCertificationError, setMedicalDeclarationPatientCertificationError] = useState<string | null>(null);
  const [medicalHistoryErrors, setMedicalHistoryErrors] = useState<Record<string, string>>({});
  const [fmeMedicalHistoryErrors, setFmeMedicalHistoryErrors] = useState<Record<string, string>>({});
  const [abnormalityChecklistErrors, setAbnormalityChecklistErrors] = useState<Record<string, string>>({});
  const [drivingLicenseClass, setDrivingLicenseClass] = useState('');
  const [purposeOfExam, setPurposeOfExam] = useState('');
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
  
  // Clinic selection state
  const [clinics, setClinics] = useState<UserClinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [lastRecordedDate, setLastRecordedDate] = useState<string>('');
  const [heightError, setHeightError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [policeReportError, setPoliceReportError] = useState<string | null>(null);
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [examinationDateError, setExaminationDateError] = useState<string | null>(null);
  const [examinationDateBlurred, setExaminationDateBlurred] = useState(false);
  const [drivingLicenceTimingError, setDrivingLicenceTimingError] = useState<string | null>(null);
  const [drivingLicenceTimingWarning, setDrivingLicenceTimingWarning] = useState<string | null>(null);
  const [chestXrayTbError, setChestXrayTbError] = useState<string | null>(null);
  
  const [purposeOfExamWarning, setPurposeOfExamWarning] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isEditingFromSummary, setIsEditingFromSummary] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [testFin, setTestFin] = useState<string>('');
  const [showFinChangeDialog, setShowFinChangeDialog] = useState(false);
  const [pendingFinValue, setPendingFinValue] = useState<string>('');
  const [previousFinValue, setPreviousFinValue] = useState<string>('');
  const [confirmedFinValue, setConfirmedFinValue] = useState<string>(''); // FIN value after blur validation
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);
  
  // Track last saved state to detect actual changes
  const [lastSavedState, setLastSavedState] = useState<{
    examType: ExamType | '';
    patientName: string;
    patientNric: string;
    patientPassportNo?: string;
    patientDateOfBirth: string;
    drivingLicenseClass: string;
    purposeOfExam: string;
    examinationDate: string;
    formData: Record<string, any>;
  } | null>(null);
  
  const [requiredTests, setRequiredTests] = useState<{
    pregnancy: boolean;
    syphilis: boolean;
    hiv: boolean;
    chestXray: boolean;
  }>({
    pregnancy: true,
    syphilis: true,
    hiv: true,
    chestXray: true,
  });
  // Ref to remember which NRIC we last looked up to avoid duplicate fetches
  const lastLookedUpNricRef = useRef<string | null>(null);

  // Workflow rules - centralized business logic for permissions and state management
  const workflow = useSubmissionWorkflow(
    {
      examType,
      status: submissionStatus,
      hasId: !!id,
    },
    user
  );

  // Helper function to check if accordion data (beyond patient info) has been filled
  const hasAccordionDataFilled = (): boolean => {
    // Check examination date
    if (examinationDate) return true;
    
    // Check if any formData exists (excluding auto-populated fields from API)
    // These fields are set automatically by patient lookup and shouldn't trigger the warning
    const autoPopulatedFields = ['hivTestRequired', 'chestXrayRequired', 'gender', 'height'];
    
    if (Object.keys(formData).length > 0) {
      // Check if there's any non-empty value that's NOT auto-populated
      for (const [key, value] of Object.entries(formData)) {
        // Skip auto-populated fields
        if (autoPopulatedFields.includes(key)) {
          continue;
        }
        // If we find any user-entered data, return true
        if (value !== '' && value !== null && value !== undefined) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Helper function to clear all accordion data (keeping only patient info)
  const clearAccordionData = () => {
    setExaminationDate('');
    setFormData({});
    setCompletedSections(new Set());
    setActiveAccordion('patient-info');
    setLastRecordedHeight('');
    setLastRecordedWeight('');
    setLastRecordedDate('');
    setRequiredTests({
      pregnancy: true,
      syphilis: true,
      hiv: true,
      chestXray: true,
    });
    
    // Clear all accordion-related errors
    setExaminationDateError(null);
    setExaminationDateBlurred(false);
    setDrivingLicenceTimingError(null);
    setDrivingLicenceTimingWarning(null);
    setHeightError(null);
    setWeightError(null);
    setPoliceReportError(null);
    setRemarksError(null);
    setChestXrayTbError(null);
    setMedicalDeclarationRemarksError(null);
    setMedicalDeclarationPatientCertificationError(null);
    setMedicalHistoryErrors({});
    setFmeMedicalHistoryErrors({});
    setAbnormalityChecklistErrors({});
  };

  // Reset form when refresh parameter is present (navigating to /new-submission from /new-submission)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Pre-select exam type from query parameter (for quick actions/favorites)
    if (searchParams.has('examType') && !id) {
      const typeParam = searchParams.get('examType');
      if (typeParam) {
        setExamType(typeParam as ExamType);
      }
    }
    
    if (searchParams.has('refresh') && !id) {
      // Reset all form state
      setExamType('');
      setPatientName('');
      setPatientNric('');
      setPatientDateOfBirth('');
      setPatientEmail('');
      setPatientMobile('');
      setDrivingLicenseClass('');
      setExaminationDate('');
      setFormData({});
      setActiveAccordion('patient-info');
      setCompletedSections(new Set());
      setShowSummary(false);
      setDeclarationChecked(false);
      setLastRecordedHeight('');
      setLastRecordedWeight('');
      setLastRecordedDate('');
      setIsNameFromApi(false);
      
      // Clear all errors
      setNricError(null);
      setPatientNameError(null);
      setEmailError(null);
      setMobileError(null);
      setExaminationDateError(null);
      setExaminationDateBlurred(false);
      setDrivingLicenceTimingError(null);
      setDrivingLicenceTimingWarning(null);
      setHeightError(null);
      setWeightError(null);
      setPoliceReportError(null);
      setRemarksError(null);
      setMedicalDeclarationRemarksError(null);
      setMedicalDeclarationPatientCertificationError(null);
      setMedicalHistoryErrors({});
      setFmeMedicalHistoryErrors({});
      setAbnormalityChecklistErrors({});
      
      // Remove the refresh parameter from URL
      navigate('/new-submission', { replace: true });
    }
  }, [location.search, id, navigate]);

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

  // Load user's clinics
  useEffect(() => {
    const fetchClinics = async () => {
      if (user?.role === 'nurse' || user?.role === 'doctor') {
        try {
          const userClinics = await usersApi.getMyClinics();
          setClinics(userClinics);
          
          // Set primary clinic as default
          const primaryClinic = userClinics.find(c => c.isPrimary);
          if (primaryClinic && !id) {
            // Only set default for new submissions, not when editing drafts
            setSelectedClinicId(primaryClinic.id);
          }
        } catch (error) {
          console.error('Failed to fetch clinics:', error);
        }
      } else if (user?.clinicId) {
        // Admin users have a single clinic
        setSelectedClinicId(user.clinicId);
      }
    };
    fetchClinics();
  }, [user, id]);

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
          
          // Access control: Nurses cannot edit submissions that are pending_approval
          // (those are with the doctor for review)
          if (user?.role === 'nurse' && existing.status === 'pending_approval') {
            toast.error('This submission is currently with the doctor for review. You cannot edit it.');
            navigate('/submissions');
            return;
          }
          
          setExamType(existing.examType);
          setSubmissionStatus(existing.status);
          
          // For MDW/FMW/WORK_PERMIT/FME drafts, restore the full name from formData if available
          // Otherwise use the patient name from the submission
          if ((existing.examType === 'SIX_MONTHLY_MDW' || 
               existing.examType === 'SIX_MONTHLY_FMW' || 
               existing.examType === 'WORK_PERMIT' ||
               existing.examType === 'FULL_MEDICAL_EXAM') && 
              existing.formData?._fullName) {
            setPatientName(existing.formData._fullName);
            setIsNameFromApi(true);
          } else {
            setPatientName(existing.patientName);
            // For MDW/FMW/WORK_PERMIT/FME drafts without stored full name, assume it came from API
            if (existing.examType === 'SIX_MONTHLY_MDW' || 
                existing.examType === 'SIX_MONTHLY_FMW' || 
                existing.examType === 'WORK_PERMIT' ||
                existing.examType === 'FULL_MEDICAL_EXAM') {
              setIsNameFromApi(true);
            }
          }
          
          setPatientNric(existing.patientNric || '');
          // Set previousFinValue when loading existing submission to enable FIN change detection
          if (existing.patientNric && isMomExamType(existing.examType)) {
            setPreviousFinValue(existing.patientNric);
          }
          setPatientPassportNo(existing.patientPassportNo || '');
          setPatientDateOfBirth(existing.patientDateOfBirth);
          setPatientEmail(existing.patientEmail || '');
          setPatientMobile(existing.patientMobile || '');
          setDrivingLicenseClass(existing.drivingLicenseClass || '');
          setPurposeOfExam(existing.purposeOfExam || '');
          setExaminationDate(existing.examinationDate || '');
          setAssignedDoctorId(existing.assignedDoctorId || '');
          setSelectedClinicId(existing.clinicId || '');
          setFormData(existing.formData);
          
          // Restore required tests from formData
          if (existing.formData) {
            setRequiredTests({
              pregnancy: true, // Always required for MDW/FMW
              syphilis: true,  // Always required for MDW/FMW
              hiv: existing.formData.hivTestRequired === 'true',
              chestXray: existing.formData.chestXrayRequired === 'true',
            });
          }
          
          // Mark sections as complete if they have valid data
          const completed = new Set<string>();
          
          // Check patient info
          const hasRequiredPatientId = isIcaExamType(existing.examType) 
            ? existing.patientPassportNo // ICA requires passport
            : existing.patientNric; // Others require NRIC
            
          if (existing.patientName && hasRequiredPatientId && existing.examinationDate) {
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
          
          // Initialize last saved state when loading existing draft
          setLastSavedState({
            examType: existing.examType,
            patientName: existing.patientName,
            patientNric: existing.patientNric || '',
            patientPassportNo: existing.patientPassportNo || '',
            patientDateOfBirth: existing.patientDateOfBirth,
            drivingLicenseClass: existing.drivingLicenseClass || '',
            purposeOfExam: existing.purposeOfExam || '',
            examinationDate: existing.examinationDate || '',
            formData: JSON.parse(JSON.stringify(existing.formData)), // Deep copy
          });
        } catch (error) {
          console.error('Failed to load submission:', error);
          toast.error('Failed to load submission');
          navigate('/drafts');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset form when creating new submission (no id)
        // Don't reset exam type if it's coming from URL parameter
        const searchParams = new URLSearchParams(location.search);
        if (!searchParams.has('examType')) {
          setExamType('');
        }
        setPatientName('');
        setPatientNric('');
        setPatientDateOfBirth('');
        setDrivingLicenseClass('');
        setExaminationDate('');
        setAssignedDoctorId('');
        setFormData({});
        setIsNameFromApi(false);
        setCompletedSections(new Set());
        setActiveAccordion('patient-info');
        setLastRecordedHeight('');
        setLastRecordedWeight('');
        setLastRecordedDate('');
        setRequiredTests({
          pregnancy: true,
          syphilis: true,
          hiv: true,
          chestXray: true,
        });
        // Reset FIN tracking states
        setPreviousFinValue('');
        setConfirmedFinValue('');
        setPendingFinValue('');
        setShowFinChangeDialog(false);
        // Reset the lookup ref so patient lookup can happen for new FINs
        lastLookedUpNricRef.current = null;
      }
    };

    loadSubmission();
  }, [id, navigate, location.search]);

  // Validate driving licence exam timing
  useEffect(() => {
    if ((examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') && 
        patientDateOfBirth && examinationDate && drivingLicenseClass) {
      
      // Skip age validation for TP_LTA when certain purposes are selected
      const skipAgeValidation = examType === 'DRIVING_VOCATIONAL_TP_LTA' && 
        (purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' || purposeOfExam === 'BAVL_ANY_AGE');
      
      if (skipAgeValidation) {
        setDrivingLicenceTimingError(null);
        setDrivingLicenceTimingWarning(null);
        return;
      }
      
      // Check if exam date is before DOB - this is a critical error
      if (new Date(examinationDate) < new Date(patientDateOfBirth)) {
        setDrivingLicenceTimingError('Examination date cannot be before date of birth.');
        setDrivingLicenceTimingWarning(null);
        return;
      }
      
      const validation = validateDrivingLicenceExamTiming(
        patientDateOfBirth,
        examinationDate,
        drivingLicenseClass
      );
      
      // Convert age validation errors to warnings instead of blocking errors
      if (!validation.isValid && validation.error) {
        setDrivingLicenceTimingError(null); // Don't block the form
        setDrivingLicenceTimingWarning(validation.error); // Show as warning instead
      } else {
        setDrivingLicenceTimingError(null);
        
        if (validation.warningMessage) {
          setDrivingLicenceTimingWarning(validation.warningMessage);
        } else {
          setDrivingLicenceTimingWarning(null);
        }
      }
    } else {
      setDrivingLicenceTimingError(null);
      setDrivingLicenceTimingWarning(null);
    }
  }, [examType, patientDateOfBirth, examinationDate, drivingLicenseClass, purposeOfExam]);

  // Check if patient is within 2 months before 65 with AGE_64_BELOW_LTA_ONLY
  useEffect(() => {
    if (examType === 'DRIVING_VOCATIONAL_TP_LTA' && 
        purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' &&
        patientDateOfBirth && 
        examinationDate) {
      
      const age = calculateAge(patientDateOfBirth, examinationDate);
      if (!age) {
        setPurposeOfExamWarning(null);
        return;
      }

      // If patient is already 65 or older, definitely warn
      if (age.years >= 65) {
        setPurposeOfExamWarning(
          'Patient is 65 or older. Please verify the exam is only for LTA Vocational Licence renewal. ' +
          'If Traffic Police Driving Licence renewal is also needed, select "Age 65 and above - Renew both Traffic Police & LTA Vocational Licence".'
        );
        return;
      }

      // If patient is 64, check if within 2 months before turning 65
      if (age.years === 64) {
        const examDate = new Date(examinationDate);
        const dob = new Date(patientDateOfBirth);
        const birthday65 = new Date(dob);
        birthday65.setFullYear(dob.getFullYear() + 65);
        
        // Calculate months difference
        const monthsDiff = (birthday65.getFullYear() - examDate.getFullYear()) * 12 + 
                           (birthday65.getMonth() - examDate.getMonth());
        
        // Warn if within 2 months before turning 65
        if (monthsDiff <= 2 && monthsDiff >= 0) {
          setPurposeOfExamWarning(
            'Patient is within 2 months of turning 65. Please verify the exam is only for LTA Vocational Licence renewal. ' +
            'If Traffic Police Driving Licence renewal is also needed, select "Age 65 and above - Renew both Traffic Police & LTA Vocational Licence".'
          );
        } else {
          setPurposeOfExamWarning(null);
        }
      } else {
        setPurposeOfExamWarning(null);
      }
    } else {
      setPurposeOfExamWarning(null);
    }
  }, [examType, purposeOfExam, patientDateOfBirth, examinationDate]);

  // Auto-set LTA vocational licence holder based on purpose of exam
  useEffect(() => {
    if (examType === 'DRIVING_VOCATIONAL_TP_LTA' && purposeOfExam) {
      // Patient holds LTA vocational licence if purpose is:
      // - AGE_64_BELOW_LTA_ONLY (LTA vocational only)
      // - BAVL_ANY_AGE (Bus Attendant's Vocational Licence)
      // - AGE_65_ABOVE_TP_LTA (Both TP and LTA vocational)
      const holdsLTAVocational = purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' || 
                                 purposeOfExam === 'BAVL_ANY_AGE' || 
                                 purposeOfExam === 'AGE_65_ABOVE_TP_LTA';
      
      setFormData(prev => ({
        ...prev,
        holdsLTAVocationalLicence: holdsLTAVocational ? 'yes' : 'no',
        hasShownLTAVocational: true, // Mark that this field has been set
      }));
    }
  }, [examType, purposeOfExam]);

  // Track form changes
  useEffect(() => {
    // If we have a saved state, compare current state with it
    if (lastSavedState) {
      const hasChanges = 
        examType !== lastSavedState.examType ||
        patientName !== lastSavedState.patientName ||
        patientNric !== lastSavedState.patientNric ||
        patientPassportNo !== (lastSavedState.patientPassportNo || '') ||
        patientDateOfBirth !== lastSavedState.patientDateOfBirth ||
        drivingLicenseClass !== lastSavedState.drivingLicenseClass ||
        purposeOfExam !== lastSavedState.purposeOfExam ||
        examinationDate !== lastSavedState.examinationDate ||
        JSON.stringify(formData) !== JSON.stringify(lastSavedState.formData);
      
      setHasUnsavedChanges(hasChanges);
    } else {
      // No saved state - mark as changed if any field has data (for new submissions)
      const hasData = !!(examType || patientName || patientNric || patientPassportNo || patientDateOfBirth || drivingLicenseClass ||
                      purposeOfExam || examinationDate || Object.keys(formData).length > 0);
      setHasUnsavedChanges(hasData);
    }
  }, [examType, patientName, patientNric, patientPassportNo, patientDateOfBirth, drivingLicenseClass, purposeOfExam, examinationDate, formData, setHasUnsavedChanges, lastSavedState]);

  // Reset unsaved changes when component unmounts
  useEffect(() => {
    return () => {
      setHasUnsavedChanges(false);
    };
  }, [setHasUnsavedChanges]);

  // Scroll accordion into view when it expands
  useEffect(() => {
    if (activeAccordion) {
      const scrollToAccordion = async () => {
        // Wait for DOM to update with the new accordion state
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        
        // Find all accordion triggers - they have data-radix-collection-item and aria-expanded attributes
        const allTriggers = document.querySelectorAll('button[data-radix-collection-item][aria-expanded]');
        
        // Find the one that's currently open
        let openTrigger: Element | null = null;
        allTriggers.forEach(trigger => {
          const state = trigger.getAttribute('data-state');
          if (state === 'open') {
            openTrigger = trigger;
          }
        });
        
        if (openTrigger) {
          const triggerElement = openTrigger as HTMLElement;
          
          // Wait for the accordion animation to complete
          await new Promise<void>((resolve) => {
            let settled = false;
            
            const onDone = () => {
              if (settled) return;
              settled = true;
              triggerElement.removeEventListener('animationend', onDone);
              triggerElement.removeEventListener('transitionend', onDone);
              resolve();
            };

            triggerElement.addEventListener('animationend', onDone);
            triggerElement.addEventListener('transitionend', onDone);

            // Fallback timeout in case animations don't fire
            setTimeout(() => onDone(), 500);
          });

          // Wait additional time for content to fully render and push other elements
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const rect = triggerElement.getBoundingClientRect();
          
          // Calculate the target scroll position to position the trigger 80px from the top
          const targetScrollY = window.scrollY + rect.top - 80;
          
          // Scroll directly to the target position in one smooth motion
          window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        }
      };

      scrollToAccordion();
    }
  }, [activeAccordion]);

  // Monitor certification checkboxes and update completed sections
  useEffect(() => {
    setCompletedSections(prev => {
      const newCompleted = new Set(prev);
      
      // Check Medical Declaration certification
      const medicalDeclaration = formData.medicalDeclaration || {};
      if (!medicalDeclaration.patientCertification && newCompleted.has('medical-declaration')) {
        newCompleted.delete('medical-declaration');
      }
      
      // Check Medical History certification
      const medicalHistory = formData.medicalHistory || {};
      if (!medicalHistory.patientCertification && newCompleted.has('medical-history')) {
        newCompleted.delete('medical-history');
      }
      
      return newCompleted;
    });
  }, [formData.medicalDeclaration, formData.medicalHistory]);

  // Fetch a random test FIN when exam type supports patient lookup
  useEffect(() => {
    const shouldShowTestFin = !id && (examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'WORK_PERMIT' || examType === 'FULL_MEDICAL_EXAM');
    
    if (shouldShowTestFin) {
      patientsApi.getRandomTestFin(examType).then((result) => {
        if (result) {
          setTestFin(result.fin);
        }
      }).catch((error) => {
        console.error('Failed to fetch test FIN:', error);
      });
    } else {
      setTestFin('');
    }
  }, [examType, id]);

  // Fetch patient name from API for SIX_MONTHLY_MDW, SIX_MONTHLY_FMW, WORK_PERMIT and FULL_MEDICAL_EXAM (but not ICA)
  // This runs only when confirmedFinValue changes (set on blur after validation)
  useEffect(() => {
    // Don't fetch if there's a pending FIN change awaiting user confirmation
    if (showFinChangeDialog || pendingFinValue) {
      return;
    }
    
    // Skip if no confirmed FIN value
    if (!confirmedFinValue) {
      return;
    }
    
    // Only fetch for specific exam types
    const shouldFetchPatientName = 
      !isIcaExamType(examType) &&
      (examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'WORK_PERMIT' || examType === 'FULL_MEDICAL_EXAM');

    if (!shouldFetchPatientName) {
      return;
    }

    const fetchPatientName = async () => {
      // Guard: if we've already looked up this NRIC, skip
      if (lastLookedUpNricRef.current === confirmedFinValue) {
        console.debug('[NewSubmission] Skipping fetch - NRIC already looked up', { nric: confirmedFinValue });
        return;
      }
      
      setIsLoadingPatient(true);
      try {
        const patient = await patientsApi.getByNric(confirmedFinValue);
        if (patient) {
          lastLookedUpNricRef.current = confirmedFinValue;
          setPatientName(patient.name);
          setIsNameFromApi(true);
          
          // Set gender from API for FME
          if (examType === 'FULL_MEDICAL_EXAM' && patient.gender) {
            setFormData(prev => ({
              ...prev,
              gender: patient.gender,
            }));
          }
          
          // Set required tests from patient data (only for MOM exam types)
          if (isMomExamType(examType)) {
            if (patient.requiredTests) {
              setRequiredTests(patient.requiredTests);
              // Save required test flags to formData so they persist when submission is saved
              setFormData(prev => ({
                ...prev,
                hivTestRequired: patient.requiredTests!.hiv ? 'true' : 'false',
                chestXrayRequired: patient.requiredTests!.chestXray ? 'true' : 'false',
              }));
            } else {
              // Default to all tests required if not specified (MOM exams only)
              setRequiredTests({
                pregnancy: true,
                syphilis: true,
                hiv: true,
                chestXray: true,
              });
              setFormData(prev => ({
                ...prev,
                hivTestRequired: 'true',
                chestXrayRequired: 'true',
              }));
            }
          }
          
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
          
          toast.success(`Patient found: ${maskName(patient.name)}`);
        } else {
          // Clear name and vitals if no patient found
          if (isNameFromApi) {
            setPatientName('');
            setIsNameFromApi(false);
            setLastRecordedHeight('');
            setLastRecordedWeight('');
            setLastRecordedDate('');
            // Reset to default all tests required (only for MOM exam types)
            if (isMomExamType(examType)) {
              setRequiredTests({
                pregnancy: true,
                syphilis: true,
                hiv: true,
                chestXray: true,
              });
              setFormData(prev => ({
                ...prev,
                hivTestRequired: 'true',
                chestXrayRequired: 'true',
              }));
            }
            toast.info('Patient not found.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch patient:', error);
        // Don't show error toast, just allow manual entry
      } finally {
        setIsLoadingPatient(false);
      }
    };

    // No debounce needed - this only runs on blur
    fetchPatientName();
  }, [confirmedFinValue, examType, id, showFinChangeDialog, pendingFinValue]);

  // Track FME medical examination completion
  useEffect(() => {
    if (examType === 'FULL_MEDICAL_EXAM') {
      const isMedicalExaminationComplete = formData.chestXray && formData.syphilis;
      
      if (isMedicalExaminationComplete && !completedSections.has('medical-examination')) {
        setCompletedSections(prev => new Set(prev).add('medical-examination'));
      } else if (!isMedicalExaminationComplete && completedSections.has('medical-examination')) {
        // Remove completion if fields are cleared
        setCompletedSections(prev => {
          const newSet = new Set(prev);
          newSet.delete('medical-examination');
          return newSet;
        });
      }
    }
  }, [examType, formData.chestXray, formData.syphilis, completedSections]);

  const handleFormDataChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear chest X-ray TB error when user selects an option
    if (key === 'chestXrayTb' && value) {
      setChestXrayTbError(null);
    }
  };

  const handleValidationError = (field: string, error: string) => {
    if (field === 'medicalDeclarationRemarks') {
      setMedicalDeclarationRemarksError(error);
    } else if (field === 'medicalDeclarationPatientCertification') {
      setMedicalDeclarationPatientCertificationError(error);
    } else if (field.startsWith('medicalHistory_')) {
      // Handle FME medical history errors (with underscore)
      setFmeMedicalHistoryErrors(prev => ({
        ...prev,
        [field]: error
      }));
    } else if (field === 'chestXray' || field === 'syphilis' || field === 'pregnancyTest') {
      // Handle FME medical examination errors
      setFmeMedicalHistoryErrors(prev => ({
        ...prev,
        [field]: error
      }));
    } else if (field.startsWith('medicalHistory')) {
      // Handle TP/LTA medical history remarks errors (without underscore)
      setMedicalHistoryErrors(prev => ({
        ...prev,
        [field]: error
      }));
    } else {
      // Handle abnormality checklist errors (fingerNoseCoordination, lungs, etc.)
      setAbnormalityChecklistErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleExamTypeChange = (value: string) => {
    const newExamType = value as ExamType;
    setExamType(newExamType);
    
    // Reset name-from-API flag when switching exam types
    if (newExamType === 'AGED_DRIVERS') {
      setIsNameFromApi(false);
    }
    
    // For ICA exams, both HIV and Chest X-ray are always required
    if (isIcaExamType(newExamType)) {
      setRequiredTests({
        pregnancy: false,
        syphilis: false,
        hiv: true,
        chestXray: true,
      });
      setFormData(prev => ({
        ...prev,
        hivTestRequired: 'true',
        chestXrayRequired: 'true',
      }));
    }
    
    // Reset completed sections and active accordion when exam type changes
    setCompletedSections(new Set());
    setActiveAccordion('patient-info');
    
    // Clear last recorded values when changing exam type
    setLastRecordedHeight('');
    setLastRecordedWeight('');
    setLastRecordedDate('');
    
    // Reset summary and declaration
    setShowSummary(false);
    setDeclarationChecked(false);
    
    // Clear all error states when changing exam type
    setNricError(null);
    setPatientNameError(null);
    setEmailError(null);
    setMobileError(null);
    setExaminationDateError(null);
    setExaminationDateBlurred(false);
    setDrivingLicenceTimingError(null);
    setDrivingLicenceTimingWarning(null);
    setHeightError(null);
    setWeightError(null);
    setPoliceReportError(null);
    setRemarksError(null);
    setMedicalDeclarationRemarksError(null);
    setMedicalDeclarationPatientCertificationError(null);
    setMedicalHistoryErrors({});
    setFmeMedicalHistoryErrors({});
    setAbnormalityChecklistErrors({});
  };

  const validatePatientInfo = (): boolean => {
    // For ICA exams, validate passport number instead of NRIC
    if (isIcaExamType(examType)) {
      // Validate Passport Number for ICA exams
      if (!patientPassportNo.trim()) {
        setPassportNoError('Passport number is required');
        return false;
      }

      const passportValidationError = validatePassportNo(patientPassportNo);
      if (passportValidationError) {
        setPassportNoError(passportValidationError);
        return false;
      }

      // For ICA exams, NRIC is optional - only validate if provided
      if (patientNric.trim()) {
        const nricValidationError = validateNricOrFin(patientNric, validateNRIC);
        if (nricValidationError) {
          setNricError(nricValidationError);
          return false;
        }
      }
    } else {
      // For non-ICA exams, validate NRIC/FIN as required
      if (!patientNric.trim()) {
        setNricError('NRIC/FIN is required');
        // scroll/focus the NRIC field
        // attempt to focus and scroll to patientNric
        try { focusFirstInvalidField && (focusFirstInvalidField as any)({ height: true, weight: true, policeReport: true, remarks: true }); } catch (e) { /* ignore */ }
        return false;
      }

      const nricValidationError = validateNricOrFin(patientNric, validateNRIC);
      if (nricValidationError) {
        setNricError(nricValidationError);
        try { focusFirstInvalidField && (focusFirstInvalidField as any)({ height: true, weight: true, policeReport: true, remarks: true }); } catch (e) { /* ignore */ }
        return false;
      }
    }
    
    // Validate Patient Name
    // Skip validation if FIN is locked (e.g., doctor editing pending_approval MOM exam)
    // because the name is already validated and stored from the API
    if (workflow.canEditFIN) {
      const patientNameValidationError = validatePatientName(patientName);
      if (patientNameValidationError) {
        setPatientNameError(patientNameValidationError);
        return false;
      }
    }
    
    // Validate DOB for AGED_DRIVERS and driver exams
    if ((examType === 'AGED_DRIVERS' || isDriverExamType(examType)) && !patientDateOfBirth) {
      toast.error('Date of Birth is required for this exam type');
      return false;
    }

    // Validate Driving Licence Class for TP and TP_LTA exams
    if ((examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') && !drivingLicenseClass) {
      toast.error('Class of Driving Licence is required for this exam type');
      return false;
    }

    // Validate Purpose of Exam for TP_LTA exams
    if (examType === 'DRIVING_VOCATIONAL_TP_LTA' && !purposeOfExam) {
      toast.error('Purpose of Exam is required for this exam type');
      return false;
    }

    // Validate Examination Date
    if (!examinationDate) {
      // Use inline error instead of toast for examination date
      setExaminationDateError('Examination Date is required');
      return false;
    }

    // Validate examination date is not in the future
    const todayString = getTodayInSingapore();
    
    if (examinationDate > todayString) {
      setExaminationDateError('Examination date cannot be in the future');
      return false;
    }

    // Validate email and mobile for driver exams
    if (isDriverExamType(examType)) {
      // Validate email if provided
      if (patientEmail) {
        const emailValidationError = validateEmail(patientEmail);
        if (emailValidationError) {
          setEmailError(emailValidationError);
          toast.error(emailValidationError);
          return false;
        }
      }
      
      // Validate mobile if provided
      if (patientMobile) {
        const mobileValidationError = validateSingaporeMobile(patientMobile);
        if (mobileValidationError) {
          setMobileError(mobileValidationError);
          toast.error(mobileValidationError);
          return false;
        }
      }
    }

    // Validate driving licence exam timing - show as warning only, do not block
    
    // clear inline exam date error if present
    if (examinationDateError) setExaminationDateError(null);
    if (emailError) setEmailError(null);
    if (mobileError) setMobileError(null);
    if (nricError) setNricError(null);
    return true;
  };

  const validateFmeMedicalHistory = (): boolean => {
    const medicalHistoryConditions = [
      'cardiovascular',
      'metabolic',
      'respiratory',
      'gastrointestinal',
      'neurological',
      'mentalHealth',
      'otherMedical',
      'previousSurgeries',
      'longTermMedications',
      'smokingHistory',
      'lifestyleRiskFactors',
      'previousInfections',
    ];

    let isValid = true;
    let firstErrorField: string | null = null;

    for (const condition of medicalHistoryConditions) {
      const fieldName = `medicalHistory_${condition}`;
      const remarksFieldName = `${fieldName}Remarks`;
      
      if (formData[fieldName] === 'yes' && !formData[remarksFieldName]?.trim()) {
        handleValidationError(remarksFieldName, 'Remarks are required when this condition is selected');
        if (!firstErrorField) {
          firstErrorField = `medicalHistory_${condition}_remarks`;
        }
        isValid = false;
      }
    }

    // Check patient certification
    if (!formData.medicalHistory_patientCertification) {
      if (!firstErrorField) {
        firstErrorField = 'medicalHistoryPatientCertification';
      }
      isValid = false;
    }

    // Scroll to first error if validation failed
    if (!isValid && firstErrorField) {
      setTimeout(() => {
        const element = document.getElementById(firstErrorField!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
    }

    return isValid;
  };

  const validateFmeMedicalExamination = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    // Validate Chest X-ray (mandatory)
    if (!formData.chestXray) {
      newErrors.chestXray = 'Chest X-ray result is required';
      isValid = false;
    }

    // Note: Don't block continuing to summary if pending NTBCC clearance is selected
    // The warning will be shown on the summary page and Submit button will be disabled

    // Validate Syphilis (mandatory)
    if (!formData.syphilis) {
      newErrors.syphilis = 'Syphilis test result is required';
      isValid = false;
    }

    // Validate pregnancy test if pregnancy exempted is selected for X-ray
    if (formData.chestXray === 'pregnancy-exempted' && formData.test_pregnancy !== 'yes') {
      newErrors.pregnancyTest = 'Pregnancy test must be positive when "Exempted due to pregnancy" is selected';
      isValid = false;
    }

    // Update errors state
    if (!isValid) {
      setFmeMedicalHistoryErrors(prev => ({ ...prev, ...newErrors }));
      
      // Scroll to first error
      setTimeout(() => {
        const firstErrorField = !formData.chestXray ? 'chestXray' : 
                               !formData.syphilis ? 'syphilis' :
                               'test_pregnancy';
        const element = document.getElementById(firstErrorField === 'chestXray' ? 'xray-normal' : 
                                               firstErrorField === 'syphilis' ? 'syphilis-normal' :
                                               'test_pregnancy');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    return isValid;
  };

  const validateExamSpecific = (): boolean => {
    
    // For ICA exams, require chest X-ray TB question to be answered and passport number
    if (isIcaExamType(examType)) {
      let hasError = false;
      
      // Validate passport number
      if (!patientPassportNo || !patientPassportNo.trim()) {
        setPassportNoError('Passport number is required for ICA medical examinations');
        hasError = true;
      } else {
        const passportError = validatePassportNo(patientPassportNo);
        if (passportError) {
          setPassportNoError(passportError);
          hasError = true;
        } else {
          setPassportNoError(null);
        }
      }
      
      // Validate chest X-ray TB
      if (!formData.chestXrayTb) {
        setChestXrayTbError('Please answer the TB (Chest X-ray) question');
        hasError = true;
      } else {
        setChestXrayTbError(null);
      }
      
      if (hasError) {
        // Scroll to patient info accordion if passport error
        if (passportNoError) {
          setActiveAccordion('patient-info');
        }
        return false;
      }
    }
    
    // For Six-Monthly MDW, require height and weight and validate police report if physical exam concerns are present
    if (examType === 'SIX_MONTHLY_MDW') {
      // Height and weight are mandatory
      if (!formData.height || !formData.weight) {
        // Set inline errors instead of toasts
        if (!formData.height) setHeightError('Height is required');
        if (!formData.weight) setWeightError('Weight is required');
  // Scroll to first invalid field (height/weight) so user sees the error
  focusFirstInvalidField({ height: !!formData.height, weight: !!formData.weight, policeReport: !!formData.policeReport, remarks: !!formData.remarks });
        return false;
      }

      const hasPhysicalExamConcerns = 
        formData.suspiciousInjuries === 'true' || 
        formData.unintentionalWeightLoss === 'true';
      
      if (hasPhysicalExamConcerns) {
        if (!formData.policeReport) {
          setPoliceReportError('Please indicate whether you have made a police report');
        }
        if (!formData.remarks) {
          setRemarksError('Please provide your assessment in the remarks section');
        }
        if (!formData.policeReport || !formData.remarks) {
          // scroll and focus the first invalid field
          focusFirstInvalidField({ height: !!formData.height, weight: !!formData.weight, policeReport: !!formData.policeReport, remarks: !!formData.remarks });
          return false;
        }
      }

      // Additionally, if the clinician explicitly checked the "has additional remarks" checkbox,
      // require remarks even if there are no physical exam concerns.
      if (formData.hasAdditionalRemarks === 'true') {
        if (!formData.remarks || !formData.remarks.trim()) {
          setRemarksError('Please provide your assessment in the remarks section');
          // scroll and focus the remarks textarea
          focusFirstInvalidField({ height: !!formData.height, weight: !!formData.weight, policeReport: !!formData.policeReport, remarks: !!formData.remarks });
          return false;
        }
      }

      // If the remarks textarea is present in the DOM (e.g. checkbox was just toggled and
      // formData may not have updated yet), validate its value directly to avoid a race.
      try {
        const remarksEl = document.getElementById('remarks') as HTMLTextAreaElement | null;
        if (remarksEl) {
          const val = (remarksEl.value || '').trim();
          if (!val) {
            setRemarksError('Please provide your assessment in the remarks section');
            // ensure we scroll/focus the textarea
            focusFirstInvalidField({ height: !!formData.height, weight: !!formData.weight, policeReport: !!formData.policeReport, remarks: !!formData.remarks });
            return false;
          }
        }
      } catch (e) {
        // ignore DOM errors
      }

      // Also check the 'hasAdditionalRemarks' checkbox element directly in case its
      // state hasn't propagated into formData yet. If the checkbox is checked, require remarks.
      try {
        const checkboxEl = document.getElementById('hasAdditionalRemarks') as HTMLElement | null;
        if (checkboxEl) {
          // Radix checkbox may not expose `.checked`; it uses data-state="checked" or aria-checked
          const isChecked = checkboxEl.getAttribute('data-state') === 'checked' || checkboxEl.getAttribute('aria-checked') === 'true';
          if (isChecked) {
            const val = (formData.remarks || '').trim();
            // If formData doesn't yet reflect the checkbox toggle, also check the textarea DOM
            const remarksEl = document.getElementById('remarks') as HTMLTextAreaElement | null;
            const domVal = remarksEl ? (remarksEl.value || '').trim() : '';
            if (!val && !domVal) {
              setRemarksError('Please provide your assessment in the remarks section');
              focusFirstInvalidField({ height: !!formData.height, weight: !!formData.weight, policeReport: !!formData.policeReport, remarks: !!formData.remarks });
              return false;
            }
          }
        }
      } catch (e) {
        // ignore DOM errors
      }
    }
    
    // clear inline errors if validation passes
    setHeightError(null);
    setWeightError(null);
    setPoliceReportError(null);
    setRemarksError(null);
    return true;
  };

  // Scroll and focus the first invalid field in order: height, weight, police report, remarks
  const focusFirstInvalidField = async (states: { height: boolean; weight: boolean; policeReport: boolean; remarks: boolean; }) => {
    
    const getScrollableParent = (node: HTMLElement | null): HTMLElement | null => {
      let el = node?.parentElement;
      const html = document.documentElement;
      while (el && el !== html && el !== document.body) {
        const style = getComputedStyle(el);
        const overflowY = style.overflowY;
        const isScrollable = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && el.scrollHeight > el.clientHeight;
        if (isScrollable) return el;
        el = el.parentElement;
      }
      return document.scrollingElement as HTMLElement | null;
    };

    const scrollToAndFocus = async (elId: string): Promise<boolean> => {
      const el = document.getElementById(elId) as HTMLElement | null;
      if (!el) return false;

      // If the element is inside an animated/collapsing container that uses overflow:hidden,
      // scrolling the window might not reveal it. Ensure the accordion is opened first so
      // measurements (getBoundingClientRect) return useful values. We'll listen for the
      // accordion to become 'open' via the data-state attribute or animation/transition end
      // and fall back to a short timeout.
      const accordionAncestor = el.closest('[data-state]') as HTMLElement | null;
      const waitForAccordionOpen = (ancestor: HTMLElement | null): Promise<void> => {
        return new Promise((resolve) => {
          if (!ancestor) return resolve();
          try {
            // If already open, resolve immediately
            if (ancestor.getAttribute('data-state') === 'open') return resolve();

            let settled = false;
            const onDone = () => {
              if (settled) return;
              settled = true;
              ancestor.removeEventListener('animationend', onDone);
              ancestor.removeEventListener('transitionend', onDone);
              resolve();
            };

            ancestor.addEventListener('animationend', onDone);
            ancestor.addEventListener('transitionend', onDone);

            // Also poll the attribute in case the library toggles it without firing animations
            const start = Date.now();
            const poll = () => {
              if (ancestor.getAttribute('data-state') === 'open') {
                onDone();
                return;
              }
              if (Date.now() - start > 500) {
                // timeout fallback
                onDone();
                return;
              }
              requestAnimationFrame(poll);
            };
            requestAnimationFrame(poll);
          } catch (e) {
            // if anything goes wrong, don't block
            resolve();
          }
        });
      };

      // If the accordion is closed, request it to open and wait for it to finish opening
      try {
        if (accordionAncestor && accordionAncestor.getAttribute('data-state') !== 'open') {
          setActiveAccordion('exam-specific');
          // wait for open/animation end (max ~500ms)
          // eslint-disable-next-line no-await-in-loop
          await waitForAccordionOpen(accordionAncestor);
        }

      } catch (e) {
        // ignore and continue to measurement
      }

      
      let originalOverflow: string | null = null;
      if (accordionAncestor) {
        const style = getComputedStyle(accordionAncestor);
        if (style.overflowY === 'hidden') {
          originalOverflow = accordionAncestor.style.overflow;
          accordionAncestor.style.overflow = 'visible';
        }
      }

      const scrollableParent = getScrollableParent(el);

      

      try {
        if (scrollableParent && scrollableParent !== document.scrollingElement) {
          // Compute offset relative to the parent
          const parentRect = scrollableParent.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const offsetTop = elRect.top - parentRect.top + scrollableParent.scrollTop - (parentRect.height / 2) + (elRect.height / 2);
          scrollableParent.scrollTo({ top: offsetTop, behavior: 'smooth' });
        } else {
          // Fallback to window scrolling which will work when there's no intervening overflow-hidden
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

  // Focus after a short delay to allow smooth scroll/accordion animations to complete
        setTimeout(() => {
          const focusable = el.querySelector<HTMLElement>('input, textarea, select, button, [tabindex]');
          try {
            if (focusable) {
              focusable.focus();
              if ((focusable as HTMLInputElement).setSelectionRange) {
                const val = (focusable as HTMLInputElement).value || '';
                (focusable as HTMLInputElement).setSelectionRange(val.length, val.length);
              }
            } else if (typeof (el as any).focus === 'function') {
              (el as any).focus();
            }
          } catch (e) {
            // ignore focus errors
          }
        }, 260);

        

        // Restore any temporary overflow change after animations
        if (accordionAncestor && originalOverflow !== null) {
          setTimeout(() => {
            try {
              accordionAncestor.style.overflow = originalOverflow || '';
            } catch (e) {
              // ignore
            }
          }, 700);
        }

        return true;
      } catch (e) {
        return false;
      }
    };

    // If the invalid field is part of the exam-specific section, make sure that accordion is open
    // so its contents are rendered and not collapsed.
    const openExamAccordionIfNeeded = () => {
      try {
        // activeAccordion is a state variable; use setter to open exam-specific
        setActiveAccordion('exam-specific');
      } catch (e) {
        // ignore
      }
    };

    if (!states.height) {
      openExamAccordionIfNeeded();
      // eslint-disable-next-line no-await-in-loop
      if (await scrollToAndFocus('height')) return;
    }
    if (!states.weight) {
      openExamAccordionIfNeeded();
      // eslint-disable-next-line no-await-in-loop
      if (await scrollToAndFocus('weight')) return;
    }
    if (!states.policeReport) {
      openExamAccordionIfNeeded();
      // eslint-disable-next-line no-await-in-loop
      if (await scrollToAndFocus('policeReport-yes')) return;
    }
    if (!states.remarks) {
      openExamAccordionIfNeeded();
      // eslint-disable-next-line no-await-in-loop
      if (await scrollToAndFocus('remarks')) return;
    }
  };

  const validateRemarks = (): boolean => {
    // Remarks are required when the "has additional remarks" checkbox is checked
    const wantsRemarks = formData.hasAdditionalRemarks === 'true';
    if (wantsRemarks) {
      if (!formData.remarks || !formData.remarks.trim()) {
        setRemarksError('Please provide your assessment in the remarks section');
        // attempt to focus/scroll to remarks so the user sees the inline error
        try { focusFirstInvalidField && (focusFirstInvalidField as any)({ height: !!formData.height, weight: !!formData.weight, policeReport: !!formData.policeReport, remarks: !!formData.remarks }); } catch (e) { /* ignore */ }
        return false;
      }
    }

    // clear any previous remarks error
    if (remarksError) setRemarksError(null);
    return true;
  };

  // Compute whether the Patient Information section is complete and valid.
  // This is used to enable/disable other accordions when patient-info is incomplete or has inline errors.
  const isPatientInfoValid = Boolean(
    // For ICA exams, require passport number; for others, require NRIC
    (isIcaExamType(examType) ? (patientPassportNo.trim() && !passportNoError) : (patientNric.trim() && !nricError)) &&
    patientName.trim() &&
    ((examType === 'AGED_DRIVERS' || isDriverExamType(examType)) ? patientDateOfBirth : true) &&
    ((examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') ? drivingLicenseClass : true) &&
    (examType === 'DRIVING_VOCATIONAL_TP_LTA' ? purposeOfExam : true) &&
    examinationDate &&
    !examinationDateError &&
    !emailError &&
    !mobileError
  );

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
      
      // If editing from summary, check AMT requirement for driver exams before returning
      if (isEditingFromSummary && isDriverExamType(examType)) {
        console.log('🔍 Checking AMT requirement...');
        console.log('patientDateOfBirth:', patientDateOfBirth);
        console.log('examinationDate:', examinationDate);
        console.log('drivingLicenseClass:', drivingLicenseClass);
        
        const newAmtRequired = recalculateAMTRequirement();
        console.log('newAmtRequired:', newAmtRequired);
        console.log('oldAmtRequired:', formData.amtRequired);
        
        // Update formData.amtRequired if it changed
        if (newAmtRequired !== null && newAmtRequired !== formData.amtRequired) {
          setFormData(prev => ({ ...prev, amtRequired: newAmtRequired }));
          console.log('✏️ Updated amtRequired to:', newAmtRequired);
          
          // If AMT newly became required, remove it from completed sections
          if (newAmtRequired === true && formData.amtRequired === false) {
            console.log('🔄 AMT became required - clearing completion status');
            setCompletedSections(prev => {
              const newSet = new Set(prev);
              newSet.delete('amt');
              return newSet;
            });
          }
        }
        
        // If AMT is required OR we can't determine (null), check if AMT section was completed
        if (newAmtRequired === true || newAmtRequired === null) {
          // Check if AMT section was completed (user visited and clicked continue)
          // When editing from summary, also check if AMT data exists in formData
          const hasAmtData = formData.amt && (
            formData.amt.score !== undefined || 
            Object.keys(formData.amt).some(key => key !== 'score' && formData.amt[key] === true)
          );
          const amtSectionCompleted = completedSections.has('amt') || hasAmtData;
          console.log('amtSectionCompleted:', amtSectionCompleted);
          console.log('completedSections.has(amt):', completedSections.has('amt'));
          console.log('hasAmtData:', hasAmtData);
          console.log('formData.amt:', formData.amt);
          
          if (!amtSectionCompleted) {
            // AMT is required/uncertain but section not completed
            const oldAmtRequired = formData.amtRequired;
            console.log('⚠️ AMT required/uncertain but not completed! Showing toast...');
            if (newAmtRequired === null) {
              toast.warning('Please complete the AMT questions to continue.');
            } else if (newAmtRequired !== oldAmtRequired) {
              toast.warning('AMT is now required. Please complete the AMT questions.');
            } else {
              toast.warning('Please complete the AMT questions before continuing.');
            }
            console.log('📍 Setting accordion to amt');
            setActiveAccordion('amt');
            setIsEditingFromSummary(false);
            return;
          }
        }
        
        console.log('✅ AMT check passed, going to summary');
        // AMT check passed or not required, go back to summary
        setActiveAccordion('summary');
        setIsEditingFromSummary(false);
        return;
      }
      
      // If editing from summary for non-driver exams, go back to summary
      if (isEditingFromSummary) {
        setActiveAccordion('summary');
        setIsEditingFromSummary(false);
        return;
      }
      
      // For driver exams from patient-info, go directly to medical-declaration (first exam section)
      if (currentSection === 'patient-info' && isDriverExamType(examType)) {
        setActiveAccordion('medical-declaration');
      } else if (currentSection === 'patient-info' && examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT') {
        // For short form, go to overall-assessment
        setActiveAccordion('overall-assessment');
      } else {
        // Move to next section
        setActiveAccordion(nextSection);
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!examType || !user) return;

    try {
      setIsSaving(true);

      // For MDW/FMW/WORK_PERMIT/FME, store both masked and full name in formData
      const enhancedFormData = { ...formData };
      if ((examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'WORK_PERMIT' || examType === 'FULL_MEDICAL_EXAM') && isNameFromApi) {
        enhancedFormData._maskedName = maskName(patientName);
        enhancedFormData._fullName = patientName;
      }

      const submissionData: any = {
        examType,
        patientName,
        formData: enhancedFormData,
        // Only include routeForApproval for new submissions, not updates
        // This preserves the existing status (e.g., pending_approval) when saving edits
        ...(workflow.shouldIncludeRouteForApproval && { routeForApproval: false }),
        assignedDoctorId: assignedDoctorId || undefined,
      };

      // For updates, always include these fields (even if empty string) to allow clearing
      // For new drafts, only include if not empty
      if (id) {
        submissionData.patientNric = patientNric || null;
        submissionData.patientPassportNo = patientPassportNo || null;
        submissionData.patientDateOfBirth = patientDateOfBirth || null;
        submissionData.patientEmail = patientEmail || null;
        submissionData.patientMobile = patientMobile ? patientMobile.replace(/\s/g, '') : null;
        submissionData.drivingLicenseClass = drivingLicenseClass || null;
        submissionData.purposeOfExam = purposeOfExam || null;
        submissionData.examinationDate = examinationDate || null;
        if (selectedClinicId) submissionData.clinicId = selectedClinicId;
      } else {
        if (patientNric) submissionData.patientNric = patientNric;
        if (patientPassportNo) submissionData.patientPassportNo = patientPassportNo;
        if (patientDateOfBirth) submissionData.patientDateOfBirth = patientDateOfBirth;
        if (patientEmail) submissionData.patientEmail = patientEmail;
        if (patientMobile) submissionData.patientMobile = patientMobile.replace(/\s/g, '');
        if (drivingLicenseClass) submissionData.drivingLicenseClass = drivingLicenseClass;
        if (purposeOfExam) submissionData.purposeOfExam = purposeOfExam;
        if (examinationDate) submissionData.examinationDate = examinationDate;
        if (selectedClinicId) submissionData.clinicId = selectedClinicId;
      }

      if (id) {
        // Update existing draft - stay on the same page
        const updated = await submissionsApi.update(id, submissionData);
        // Preserve the submission status after update
        if (updated.status) {
          setSubmissionStatus(updated.status);
        }
        toast.success('Draft updated successfully');
        // Do not navigate away; remain on the draft edit page
      } else {
        // Create new draft and navigate to its draft edit URL so user stays on the page
        const created = await submissionsApi.create(submissionData);
        // Set the status of the newly created draft
        if (created.status) {
          setSubmissionStatus(created.status);
        }
        toast.success('Draft saved successfully');
        // Navigate to /draft/:id which will load the draft into the form
        navigate(`/draft/${created.id}`, { replace: true });
      }
      
      // Update formData to match what was saved
      setFormData(enhancedFormData);
      
      // Save current state as the last saved state
      setLastSavedState({
        examType,
        patientName,
        patientNric,
        patientPassportNo,
        patientDateOfBirth,
        drivingLicenseClass,
        purposeOfExam,
        examinationDate,
        formData: JSON.parse(JSON.stringify(enhancedFormData)), // Deep copy with masked/full names
      });
      
      setHasUnsavedChanges(false); // Clear unsaved changes after saving state
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
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

      // For MDW/FMW/WORK_PERMIT/FME, store both masked and full name in formData
      const enhancedFormData = { ...formData };
      if ((examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'WORK_PERMIT' || examType === 'FULL_MEDICAL_EXAM') && isNameFromApi) {
        enhancedFormData._maskedName = maskName(patientName);
        enhancedFormData._fullName = patientName;
      }

      const submissionData = {
        examType,
        patientName,
        ...(patientNric && { patientNric }), // Optional for ICA exams
        ...(patientPassportNo && { patientPassportNo }), // Include passport number if provided
        ...(patientDateOfBirth && { patientDateOfBirth }), // Only include if not empty
        ...(patientEmail && { patientEmail }), // Only include if not empty
        ...(patientMobile && { patientMobile: patientMobile.replace(/\s/g, '') }), // Remove spaces before saving
        ...(drivingLicenseClass && { drivingLicenseClass }), // Only include if not empty
        ...(purposeOfExam && { purposeOfExam }), // Only include if not empty
        ...(examinationDate && { examinationDate }), // Only include if not empty
        formData: enhancedFormData,
        // Don't send routeForApproval: false for doctors - backend treats that as draft
        // Only send routeForApproval: true when nurse is routing for approval
        ...(user.role === 'nurse' && isRouteForApproval && { routeForApproval: true }),
        assignedDoctorId: assignedDoctorId || undefined,
        ...(selectedClinicId && { clinicId: selectedClinicId }),
      };

        if (id) {
        // Update existing submission
          await submissionsApi.update(id, submissionData);

          // Submit the draft (changes status from draft to submitted/pending_approval)
          if (user.role === 'nurse' && isRouteForApproval) {
            const routed = await submissionsApi.submitForApproval(id);
            toast.success('Routed for approval successfully');
            navigate(`/acknowledgement/${routed.id}`, { replace: true });
          } else if (user.role === 'doctor') {
            // Doctor submitting directly to agency
            const submitted = await submissionsApi.submitForApproval(id);
            toast.success('Medical examination submitted successfully');
            navigate(`/acknowledgement/${submitted.id}`, { replace: true });
          } else {
            toast.success('Submission updated successfully');
            navigate('/submissions', { replace: true });
          }
      } else {
        // Create new submission
          const created = await submissionsApi.create(submissionData);

          if (user.role === 'doctor' || !isRouteForApproval) {
            toast.success('Medical examination submitted successfully');
            navigate(`/acknowledgement/${created.id}`, { replace: true });
          } else {
            toast.success('Routed for approval successfully');
            navigate(`/acknowledgement/${created.id}`, { replace: true });
          }
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to submit medical examination');
      setHasUnsavedChanges(true); // Restore unsaved changes flag on error
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to recalculate AMT requirements based on current form data
  const recalculateAMTRequirement = () => {
    if (!drivingLicenseClass || !patientDateOfBirth || !examinationDate) {
      return null; // Cannot determine
    }

    const AMT_AGE_CHECK_CLASSES = ['4', '4A', '4P', '4AP', '5', '5P'];
    
    const calculateAgeOnNextBirthday = (dob: string, examDate: string): number | null => {
      if (!dob || !examDate) return null;
      const dobDate = new Date(dob);
      const examDateObj = new Date(examDate);
      const nextBirthday = new Date(dobDate);
      nextBirthday.setFullYear(examDateObj.getFullYear());
      if (nextBirthday < examDateObj) {
        nextBirthday.setFullYear(examDateObj.getFullYear() + 1);
      }
      return nextBirthday.getFullYear() - dobDate.getFullYear();
    };

    const calculateAgeOnExamDate = (dob: string, examDate: string): number | null => {
      if (!dob || !examDate) return null;
      const dobDate = new Date(dob);
      const examDateObj = new Date(examDate);
      let age = examDateObj.getFullYear() - dobDate.getFullYear();
      const monthDiff = examDateObj.getMonth() - dobDate.getMonth();
      const dayDiff = examDateObj.getDate() - dobDate.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      return age;
    };

    const cognitiveImpairment = formData.abnormalityChecklist?.cognitiveImpairment || false;
    
    // Condition 3: Cognitive impairment
    if (cognitiveImpairment) {
      console.log('🧠 Cognitive impairment detected - AMT required');
      return true;
    }

    const ageNextBirthday = calculateAgeOnNextBirthday(patientDateOfBirth, examinationDate);
    const ageOnExamDate = calculateAgeOnExamDate(patientDateOfBirth, examinationDate);
    
    // Check if age is outside critical ranges
    const ageOutsideCriticalRange = (ageNextBirthday !== null && (ageNextBirthday < 70 || ageNextBirthday > 74)) &&
                                    (ageOnExamDate !== null && ageOnExamDate < 70);
    
    if (ageOutsideCriticalRange) {
      return false; // AMT definitely not required
    }

    // Condition 1: Class 4/4A/4P/4AP/5/5P or Private Driving Instructor AND next birthday age 70-74
    if (ageNextBirthday !== null && ageNextBirthday >= 70 && ageNextBirthday <= 74) {
      const isAMTAgeCheckClass = AMT_AGE_CHECK_CLASSES.includes(drivingLicenseClass);
      if (isAMTAgeCheckClass || formData.isPrivateDrivingInstructor === 'yes') {
        return true;
      }
    }

    // Condition 2: LTA vocational licence AND aged 70+ on examination date
    if (ageOnExamDate !== null && ageOnExamDate >= 70) {
      if (formData.holdsLTAVocationalLicence === 'yes') {
        return true;
      }
    }

    // Need more info if we can't make determination
    if (formData.isPrivateDrivingInstructor === undefined || formData.holdsLTAVocationalLicence === undefined) {
      console.log('⚠️ Cannot determine AMT - missing fields:', {
        isPrivateDrivingInstructor: formData.isPrivateDrivingInstructor,
        holdsLTAVocationalLicence: formData.holdsLTAVocationalLicence,
        ageNextBirthday,
        ageOnExamDate,
        drivingLicenseClass
      });
      return null;
    }

    console.log('AMT not required - all checks passed', {
      ageNextBirthday,
      ageOnExamDate,
      drivingLicenseClass,
      isPrivateDrivingInstructor: formData.isPrivateDrivingInstructor,
      holdsLTAVocationalLicence: formData.holdsLTAVocationalLicence
    });
    return false; // AMT not required
  };

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
          {/* debug badge removed */}
          <p className="text-slate-600">Complete the form to submit medical examination results</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examType" className="pt-4">Examination Type <span className="text-red-500">*</span></Label>
            <Select value={examType} onValueChange={handleExamTypeChange} name="examType">
              <SelectTrigger id="examType" data-testid="examType">
                <SelectValue placeholder="Select examination type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Ministry of Manpower (MOM)</SelectLabel>
                  <SelectItem value="SIX_MONTHLY_MDW">
                    Six-monthly Medical Exam (6ME) for Migrant Domestic Worker
                  </SelectItem>
                  <SelectItem value="FULL_MEDICAL_EXAM">
                    Full Medical Examination for Foreign Worker
                  </SelectItem>
                  <SelectItem value="SIX_MONTHLY_FMW">
                    Six-monthly Medical Exam (6ME) for Female Migrant Worker
                  </SelectItem>
                </SelectGroup>
                
                <SelectGroup>
                  <SelectLabel>Traffic Police (TP) / Land Transport Authority (LTA)</SelectLabel>
                  <SelectItem value="DRIVING_VOCATIONAL_TP_LTA">
                    Driving Licence / Vocational Licence (Full Form)
                  </SelectItem>
                  <SelectItem value="DRIVING_VOCATIONAL_TP_LTA_SHORT">
                    Driving Licence / Vocational Licence (Short Form)
                  </SelectItem>
                </SelectGroup>
                
                <SelectGroup>
                  <SelectLabel>Immigration & Checkpoints Authority (ICA)</SelectLabel>
                  <SelectItem value="PR_MEDICAL">
                    Medical Examination for Permanent Residency
                  </SelectItem>
                  <SelectItem value="LTVP_MEDICAL">
                    Medical Examination for Long Term Visit Pass
                  </SelectItem>
                  <SelectItem value="STUDENT_PASS_MEDICAL">
                    Medical Examination for Student Pass
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Clinic Selection - Only show for doctors and nurses */}
          {examType && (user?.role === 'doctor' || user?.role === 'nurse') && clinics.length > 0 && (
            <div className="space-y-2 max-w-lg">
              <Label htmlFor="clinic">Clinic <span className="text-red-500">*</span></Label>
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId} name="clinic">
                <SelectTrigger id="clinic">
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1 sm:gap-4">
                        <span className="font-medium">{clinic.name}</span>
                        {clinic.hciCode && (
                          <span className="text-xs text-slate-500">HCI: {clinic.hciCode}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClinicId && (() => {
                const selectedClinic = clinics.find(c => c.id === selectedClinicId);
                return selectedClinic?.phone && (
                  <p className="text-sm text-slate-600">Contact: {selectedClinic.phone}</p>
                );
              })()}
            </div>
          )}

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
                    {/* Passport Number field - only for ICA exams */}
                    {isIcaExamType(examType) && (
                      <div className="space-y-2 max-w-xs">
                        <Label htmlFor="patientPassportNo">Passport Number <span className="text-red-500">*</span></Label>
                        <Input
                          id="patientPassportNo"
                          name="passportNo"
                          value={patientPassportNo}
                          onChange={(e) => {
                            setPatientPassportNo(e.target.value.toUpperCase());
                            // Clear error on change
                            if (passportNoError) setPassportNoError(null);
                          }}
                          onBlur={(e) => {
                            const error = validatePassportNo(e.target.value);
                            setPassportNoError(error);
                          }}
                          maxLength={15}
                          className={passportNoError ? 'border-red-500' : ''}
                        />
                        {passportNoError && (
                          <InlineError>{passportNoError}</InlineError>
                        )}
                      </div>
                    )}
                    <div className="space-y-2 max-w-xs">
                      <Label htmlFor="patientNric">
                        {isIcaExamType(examType) 
                          ? 'FIN (if applicable)' 
                          : isMomExamType(examType) 
                            ? 'FIN' 
                            : 'NRIC / FIN'} 
                        {!isIcaExamType(examType) && <span className="text-red-500">*</span>}
                      </Label>
                      {testFin && workflow.canShowTestFIN && (
                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-xs text-blue-700 mb-1">Test FIN available:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-blue-900 select-all cursor-pointer px-2 py-1 bg-white rounded border border-teal-300 hover:bg-blue-100 transition-colors">
                              {testFin}
                            </code>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('[Use This Debug]', {
                                  testFin,
                                  currentPatientNric: patientNric,
                                  previousFinValue,
                                  hasPrevious: !!previousFinValue,
                                  hasAccordionData: hasAccordionDataFilled()
                                });
                                
                                // If this is a FIN change with accordion data for MOM exams
                                if (isMomExamType(examType) && previousFinValue && previousFinValue !== testFin && hasAccordionDataFilled()) {
                                  console.log('[Use This] FIN change detected with data - showing dialog');
                                  // Set the new FIN in the input field (like manual typing)
                                  setPatientNric(testFin);
                                  // Store as pending and show dialog
                                  setPendingFinValue(testFin);
                                  setShowFinChangeDialog(true);
                                } else {
                                  console.log('[Use This] Setting FIN directly');
                                  setPatientNric(testFin);
                                  // Update previousFinValue if no accordion data yet
                                  if (!hasAccordionDataFilled()) {
                                    setPreviousFinValue(testFin);
                                    // Set confirmed value to trigger patient lookup
                                    setConfirmedFinValue(testFin);
                                  }
                                  toast.success('Test FIN populated');
                                }
                              }}
                              className="text-xs h-7 px-2"
                            >
                              Use This
                            </Button>
                          </div>
                        </div>
                      )}
                      <Input
                        id="patientNric"
                        name="nric"
                        value={patientNric}
                        disabled={!workflow.canEditFIN}
                        onChange={(e) => {
                          const newValue = e.target.value.toUpperCase();
                          console.log('[FIN onChange]', {
                            oldValue: patientNric,
                            newValue,
                            currentPatientName: patientName,
                            isNameFromApi
                          });
                          setPatientNric(newValue);
                          
                          // Clear error on change
                          if (nricError) setNricError(null);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          
                          // For ICA exams, NRIC is optional - only validate if provided
                          if (isIcaExamType(examType)) {
                            if (value) {
                              const error = validateNricOrFin(value, validateNRIC);
                              setNricError(error);
                              // Store as previous value only if valid
                              if (!error && !previousFinValue) {
                                setPreviousFinValue(value);
                              }
                              // Set confirmed value to trigger patient lookup
                              if (!error) {
                                setConfirmedFinValue(value);
                              }
                            } else {
                              setNricError(null);
                            }
                          } else {
                            // For non-ICA exams, FIN is mandatory
                            if (!value) {
                              setNricError('FIN is required');
                              return;
                            }
                            
                            // Validate FIN format
                            const error = validateNricOrFin(value, validateNRIC);
                            setNricError(error);
                            
                            // For MOM exams, check if FIN changed after validation passes
                            if (!error && isMomExamType(examType)) {
                              const hasData = hasAccordionDataFilled();
                              
                              console.log('[FIN Change Debug]', {
                                currentValue: value,
                                previousFinValue,
                                hasData,
                                examType,
                                formDataKeys: Object.keys(formData),
                                examinationDate,
                                isEditingDraft: !!id
                              });
                              
                              // Check if this is a FIN change (not initial entry) with accordion data
                              if (previousFinValue && previousFinValue !== value && hasData) {
                                console.log('[FIN Change] Showing dialog - FIN changed with accordion data');
                                // Store the pending value and show dialog WITHOUT reverting the input
                                // This prevents the API from fetching during the dialog
                                setPendingFinValue(value);
                                setShowFinChangeDialog(true);
                                // DO NOT revert patientNric here - keep the new value in the input
                                // The API fetch is blocked by checking pendingFinValue in useEffect
                              } else if (!hasData) {
                                console.log('[FIN Change] No accordion data - updating previousFinValue');
                                // No accordion data filled yet - user can freely change FIN
                                // Always update previousFinValue to track the latest valid FIN
                                setPreviousFinValue(value);
                                // Set confirmed value to trigger patient lookup
                                setConfirmedFinValue(value);
                              } else {
                                console.log('[FIN Change] No action taken', {
                                  hasPrevious: !!previousFinValue,
                                  isDifferent: previousFinValue !== value,
                                  hasData
                                });
                              }
                            }
                          }
                        }}
                        className={nricError ? 'border-red-500' : ''}
                      />
                      {nricError && (
                        <InlineError>{nricError}</InlineError>
                      )}
                    </div>
                    {/* Patient Name below NRIC/FIN, with conditional rendering for exam type */}
                    <div className="space-y-2 max-w-md">
                      <Label htmlFor="patientName">
                        {isIcaExamType(examType) 
                          ? 'Full Name (as in Passport)' 
                          : isMomExamType(examType) 
                            ? 'Full Name (as in FIN)' 
                            : 'Full Name (as in NRIC / FIN)'} <span className="text-red-500">*</span>
                      </Label>
                      {(examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'WORK_PERMIT' || examType === 'FULL_MEDICAL_EXAM') ? (
                        <div className="space-y-2">
                          <Input
                            id="patientName"
                            name="patientName"
                            value={isNameFromApi ? maskName(patientName) : patientName}
                            onChange={(e) => {
                              setPatientName(e.target.value);
                              // Clear error on change
                              if (patientNameError) setPatientNameError(null);
                            }}
                            onBlur={(e) => {
                              // Trim whitespace
                              const trimmed = e.target.value.trim();
                              setPatientName(trimmed);
                              // Validate
                              const error = validatePatientName(trimmed);
                              setPatientNameError(error);
                            }}
                            placeholder={isLoadingPatient ? "Loading..." : patientNric.length !== 9 || nricError ? "Fill NRIC/FIN first" : "Enter patient name"}
                            readOnly={isNameFromApi || patientNric.length !== 9 || !!nricError || !workflow.canEditFIN}
                            disabled={patientNric.length !== 9 || !!nricError || !workflow.canEditFIN}
                            className={`${(isNameFromApi || patientNric.length !== 9 || nricError || !workflow.canEditFIN) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''} ${patientNameError ? 'border-red-500' : ''}`}
                          />
                          {patientNameError && !isNameFromApi && <InlineError>{patientNameError}</InlineError>}
                          {isNameFromApi && patientNric.length === 9 && !nricError && (
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <span className="inline-block w-1 h-1 rounded-full bg-green-500"></span>
                              Name retrieved and masked for verification. Full name will be visible after submission.
                            </p>
                          )}
                          {examType === 'FULL_MEDICAL_EXAM' && formData.gender && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Gender: {formData.gender === 'M' ? 'Male' : formData.gender === 'F' ? 'Female' : formData.gender}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <Input
                            id="patientName"
                            name="patientName"
                            value={patientName}
                            onChange={(e) => {
                              setPatientName(e.target.value);
                              // Clear error on change
                              if (patientNameError) setPatientNameError(null);
                            }}
                            onBlur={(e) => {
                              // Trim whitespace
                              const trimmed = e.target.value.trim();
                              setPatientName(trimmed);
                              // Validate
                              const error = validatePatientName(trimmed);
                              setPatientNameError(error);
                            }}
                            placeholder={isLoadingPatient ? "Loading..." : "Enter patient name"}
                            readOnly={false}
                            className={patientNameError ? 'border-red-500' : ''}
                          />
                          {patientNameError && <InlineError>{patientNameError}</InlineError>}
                        </>
                      )}
                    </div>
                    {(examType === 'AGED_DRIVERS' || isDriverExamType(examType)) && (
                      <DateOfBirthField
                        value={patientDateOfBirth}
                        onChange={setPatientDateOfBirth}
                      />
                    )}
                    {/* Email Address - Available for ICA and Driver exams only (not MOM exams or short forms) */}
                    {!isMomExamType(examType) && examType && examType !== 'DRIVING_VOCATIONAL_TP_LTA_SHORT' && (
                      <div className="space-y-2 max-w-md">
                        <Label htmlFor="patientEmail">Email Address</Label>
                        <Input
                          id="patientEmail"
                          name="patientEmail"
                          type="email"
                          value={patientEmail}
                          onChange={(e) => {
                            setPatientEmail(e.target.value);
                            // Clear error on change
                            if (emailError) setEmailError(null);
                          }}
                          onBlur={(e) => {
                            const error = validateEmail(e.target.value);
                            setEmailError(error);
                          }}
                          placeholder="example@email.com"
                          autoComplete="off"
                          className={emailError ? 'border-red-500' : ''}
                        />
                        {emailError && <InlineError>{emailError}</InlineError>}
                        {!emailError && (isIcaExamType(examType) || isDriverExamType(examType)) && <p className="text-xs text-slate-500">The medical report will be sent to this email address, if provided.</p>}
                      </div>
                    )}
                    {(isDriverExamType(examType) || examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT') && (
                      <div className="space-y-2 max-w-xs">
                        <Label htmlFor="patientMobile">
                          Mobile Number{examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT' && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="flex gap-2 items-start">
                          <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-muted-foreground whitespace-nowrap">
                            +65
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input
                              id="patientMobile"
                              name="patientMobile"
                              type="tel"
                              value={patientMobile}
                              onChange={(e) => {
                                // Only allow digits and spaces
                                const cleaned = e.target.value.replace(/[^\d\s]/g, '');
                                setPatientMobile(cleaned);
                                // Clear error on change
                                if (mobileError) setMobileError(null);
                              }}
                              onBlur={(e) => {
                                const error = validateSingaporeMobile(e.target.value);
                                setMobileError(error);
                              }}
                              placeholder="9123 4567"
                              maxLength={9}
                              className={mobileError ? 'border-red-500' : ''}
                            />
                            {mobileError && <InlineError>{mobileError}</InlineError>}
                          </div>
                        </div>
                      </div>
                    )}
                    {(examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') && (
                      <DrivingLicenceClassField
                        value={drivingLicenseClass}
                        onChange={setDrivingLicenseClass}
                      />
                    )}
                    {(examType === 'DRIVING_VOCATIONAL_TP_LTA' || examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT') && (
                      <div className="space-y-2 max-w-2xl">
                        <Label htmlFor="purposeOfExam">Purpose of Exam <span className="text-red-500">*</span></Label>
                        <Select value={purposeOfExam} onValueChange={setPurposeOfExam}>
                          <SelectTrigger id="purposeOfExam" className={!purposeOfExam ? 'text-muted-foreground' : ''}>
                            <SelectValue placeholder="Select purpose of exam" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AGE_65_ABOVE_TP_ONLY">Age 65 and above - Renew Traffic Police Driving Licence only</SelectItem>
                            <SelectItem value="AGE_65_ABOVE_TP_LTA">Age 65 and above - Renew both Traffic Police & LTA Vocational Licence</SelectItem>
                            <SelectItem value="AGE_64_BELOW_LTA_ONLY">Age 64 and below - Renew LTA Vocational Licence only</SelectItem>
                            <SelectItem value="BAVL_ANY_AGE">Renew only Bus Attendant's Vocational Licence (BAVL) regardless of age</SelectItem>
                          </SelectContent>
                        </Select>
                        {purposeOfExamWarning && (
                          <div className="flex items-start gap-3 p-4 mt-2 bg-amber-50 border-2 border-amber-400 rounded-lg shadow-sm max-w-none">
                            <svg className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-amber-900 mb-1">Please Verify Purpose of Exam</p>
                              <p className="text-sm text-amber-800 leading-relaxed">{purposeOfExamWarning}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {isDriverExamType(examType) && patientDateOfBirth && examinationDate && (
                      <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700">Age at Examination</p>
                            {calculateAge(patientDateOfBirth, examinationDate) ? (
                              <p className="text-lg font-semibold text-slate-900">
                                {formatAge(calculateAge(patientDateOfBirth, examinationDate))}
                              </p>
                            ) : examinationDateBlurred ? (
                              <p className="text-sm text-red-600 font-medium">
                                Invalid: Examination date is before date of birth
                              </p>
                            ) : null}
                          </div>
                          {(examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') && drivingLicenseClass && calculateAge(patientDateOfBirth, examinationDate) && (
                            <div>
                              {examinationDateBlurred && drivingLicenceTimingError && (
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                  <span className="text-red-700 font-medium">Outside valid period</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 max-w-xs">
                      <Label htmlFor="examinationDate">Examination Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="examinationDate"
                        name="examinationDate"
                        type="date"
                        max={getTodayInSingapore()}
                        value={examinationDate}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          setExaminationDate(selectedDate);
                          
                          // Clear previous errors
                          if (examinationDateError) setExaminationDateError(null);
                          
                          // Validate if future date
                          if (selectedDate) {
                            const todayString = getTodayInSingapore();
                            
                            if (selectedDate > todayString) {
                              setExaminationDateError('Examination date cannot be in the future');
                            }
                          }
                        }}
                        onBlur={() => setExaminationDateBlurred(true)}
                        aria-invalid={!!examinationDateError}
                        className={`${examinationDateError ? 'border-red-500 focus:border-red-500 focus-visible:border-red-500 focus:ring-destructive' : ''}`}
                      />
                      {examinationDateError && (
                        <InlineError>{examinationDateError}</InlineError>
                      )}
                    </div>
                    {drivingLicenceTimingWarning && (
                      <div className="flex items-start gap-3 p-4 mt-2 bg-amber-50 border-2 border-amber-400 rounded-lg shadow-sm max-w-none">
                        <svg className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-amber-900 mb-1">Age Validation Warning</p>
                          <p className="text-sm text-amber-800 leading-relaxed">{drivingLicenceTimingWarning}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-start mt-4">
                    <Button 
                      type="button"
                      onClick={() => {
                        if (examType === 'FULL_MEDICAL_EXAM') {
                          // For FME, navigate to medical-history accordion
                          setCompletedSections(prev => new Set(prev).add('patient-info'));
                          if (isEditingFromSummary) {
                            setActiveAccordion('summary');
                            setIsEditingFromSummary(false);
                          } else {
                            setActiveAccordion('medical-history');
                          }
                        } else {
                          handleContinue('patient-info', 'exam-specific');
                        }
                      }}
                      disabled={!isPatientInfoValid}
                    >
                      {isEditingFromSummary ? 'Continue to Summary' : 'Continue'}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* For FME, show Medical History and Medical Examination as separate accordions */}
              {examType === 'FULL_MEDICAL_EXAM' && (
                <>
                  <AccordionItem value="medical-history">
                    <AccordionTrigger isCompleted={completedSections.has('medical-history')} isDisabled={!isPatientInfoValid}>
                      <div className="flex items-center gap-2">
                        <span>Medical History of Patient</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <FullMedicalExamFields
                        formData={formData}
                        handleInputChange={(e) => {
                          const { name, value } = e.target;
                          handleFormDataChange(name, value);
                        }}
                        gender={formData.gender}
                        section="medical-history"
                        errors={fmeMedicalHistoryErrors}
                        onValidate={handleValidationError}
                      />
                      <div className="flex justify-start mt-4">
                        <Button 
                          type="button"
                          disabled={!formData.medicalHistory_patientCertification}
                          onClick={() => {
                            if (validateFmeMedicalHistory()) {
                              setCompletedSections(prev => new Set(prev).add('medical-history'));
                              if (isEditingFromSummary) {
                                setActiveAccordion('summary');
                                setIsEditingFromSummary(false);
                              } else {
                                setActiveAccordion('medical-examination');
                              }
                            }
                          }}
                        >
                          {isEditingFromSummary ? 'Continue to Summary' : 'Continue'}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="medical-examination">
                    <AccordionTrigger isCompleted={completedSections.has('medical-examination')} isDisabled={!completedSections.has('medical-history') && !completedSections.has('medical-examination')}>
                      <div className="flex items-center gap-2">
                        <span>Medical Examination</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <FullMedicalExamFields
                        formData={formData}
                        handleInputChange={(e) => {
                          const { name, value } = e.target;
                          handleFormDataChange(name, value);
                        }}
                        gender={formData.gender}
                        section="medical-examination"
                        errors={fmeMedicalHistoryErrors}
                        onValidate={handleValidationError}
                      />
                      <div className="flex justify-start mt-4">
                        <Button 
                          type="button"
                          onClick={() => {
                            if (validateFmeMedicalExamination()) {
                              setCompletedSections(prev => new Set(prev).add('medical-examination'));
                              setCompletedSections(prev => new Set(prev).add('exam-specific'));
                              setShowSummary(true);
                              setActiveAccordion('summary');
                              if (isEditingFromSummary) {
                                setIsEditingFromSummary(false);
                              }
                            }
                          }}
                        >
                          Continue to Summary
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </>
              )}

              {/* Examination Details - hidden for driver exams, FME, and short forms as they have their own structure */}
              {!isDriverExamType(examType) && examType !== 'FULL_MEDICAL_EXAM' && examType !== 'DRIVING_VOCATIONAL_TP_LTA_SHORT' && (
              <AccordionItem value="exam-specific">
                <AccordionTrigger isCompleted={completedSections.has('exam-specific')} isDisabled={!isPatientInfoValid}>
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
                      heightError={heightError}
                      setHeightError={setHeightError}
                      weightError={weightError}
                      setWeightError={setWeightError}
                      policeReportError={policeReportError}
                      setPoliceReportError={setPoliceReportError}
                      remarksError={remarksError}
                      setRemarksError={setRemarksError}
                      requiredTests={requiredTests}
                    />
                  )}
                  {examType === 'SIX_MONTHLY_FMW' && (
                    <SixMonthlyFmwFields
                      formData={formData}
                      onChange={handleFormDataChange}
                      remarksError={remarksError}
                      setRemarksError={setRemarksError}
                      requiredTests={requiredTests}
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
                  {isIcaExamType(examType) && (
                    <IcaExamFields
                      formData={formData}
                      onChange={handleFormDataChange}
                      remarksError={remarksError}
                      chestXrayTbError={chestXrayTbError}
                    />
                  )}
                  <div className="flex justify-start mt-4">
                    <Button 
                      type="button"
                      onClick={() => {
                        if (examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || isIcaExamType(examType)) {
                          // For MDW, FMW, and ICA exams, show summary page
                          if (validateExamSpecific()) {
                            setCompletedSections(prev => new Set(prev).add('exam-specific'));
                            setShowSummary(true);
                            setActiveAccordion('summary');
                          }
                        } else {
                          handleContinue('exam-specific', 'remarks');
                        }
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              )}

              {/* Driver Exam Details - render accordion items directly for TP Driving Licence */}
              {examType === 'DRIVING_LICENCE_TP' && (
                <DrivingLicenceTpAccordions
                  formData={formData}
                  onChange={handleFormDataChange}
                  completedSections={completedSections}
                  isPatientInfoValid={isPatientInfoValid}
                  isEditingFromSummary={isEditingFromSummary}
                  errors={{ 
                    medicalDeclarationRemarks: medicalDeclarationRemarksError || '',
                    medicalDeclarationPatientCertification: medicalDeclarationPatientCertificationError || '',
                    ...medicalHistoryErrors,
                    ...abnormalityChecklistErrors
                  }}
                  onValidate={handleValidationError}
                  drivingLicenseClass={drivingLicenseClass}
                  dateOfBirth={patientDateOfBirth}
                  examinationDate={examinationDate}
                  onContinue={(current, next) => {
                    setCompletedSections(prev => new Set(prev).add(current));
                    
                    console.log('📍 onContinue (DRIVING_LICENCE_TP):', { current, next, isEditingFromSummary });
                    
                    // Check AMT requirement when navigating to summary (from any section)
                    if (next === 'summary' || isEditingFromSummary) {
                      const newAmtRequired = recalculateAMTRequirement();
                      const oldAmtRequired = formData.amtRequired;
                      
                      console.log('AMT requirement check:', { newAmtRequired, oldAmtRequired });
                      
                      // Update formData.amtRequired if it changed
                      if (newAmtRequired !== null && newAmtRequired !== oldAmtRequired) {
                        setFormData(prev => ({ ...prev, amtRequired: newAmtRequired }));
                        
                        // If AMT newly became required, remove it from completed sections
                        if (newAmtRequired === true && oldAmtRequired === false) {
                          console.log('🔄 AMT became required - clearing completion status');
                          setCompletedSections(prev => {
                            const newSet = new Set(prev);
                            newSet.delete('amt');
                            return newSet;
                          });
                        }
                      }
                      
                      // If AMT is required OR uncertain (null), verify AMT section was completed
                      if (newAmtRequired === true || newAmtRequired === null) {
                        // Check if AMT section was completed (includes current if we're on AMT)
                        const amtSectionCompleted = current === 'amt' || completedSections.has('amt');
                        console.log('AMT section completed?', amtSectionCompleted, 'current:', current, 'has amt:', completedSections.has('amt'));
                        
                        if (!amtSectionCompleted) {
                          // AMT is required/uncertain but section not completed
                          if (newAmtRequired === null) {
                            toast.warning('Please complete the AMT questions to continue.');
                          } else if (newAmtRequired !== oldAmtRequired) {
                            toast.warning('AMT is now required. Please complete the AMT questions.');
                          } else {
                            toast.warning('Please complete the AMT questions before continuing.');
                          }
                          setActiveAccordion('amt');
                          setIsEditingFromSummary(false);
                          return; // Don't navigate to summary
                        }
                      }
                    }
                    
                    if (isEditingFromSummary) {
                      // When editing from summary, go back to summary
                      setActiveAccordion('summary');
                      setIsEditingFromSummary(false);
                    } else if (next === 'summary') {
                      setShowSummary(true);
                      setActiveAccordion(next);
                    } else {
                      setActiveAccordion(next);
                    }
                  }}
                />
              )}

              {/* Driver Exam Details - DRIVING_VOCATIONAL_TP_LTA with flat accordion structure */}
              {examType === 'DRIVING_VOCATIONAL_TP_LTA' && (
                <DrivingVocationalTpLtaAccordions
                  formData={formData}
                  onChange={handleFormDataChange}
                  completedSections={completedSections}
                  isPatientInfoValid={isPatientInfoValid}
                  isEditingFromSummary={isEditingFromSummary}
                  errors={{ 
                    medicalDeclarationRemarks: medicalDeclarationRemarksError || '',
                    medicalDeclarationPatientCertification: medicalDeclarationPatientCertificationError || '',
                    ...medicalHistoryErrors,
                    ...abnormalityChecklistErrors
                  }}
                  onValidate={handleValidationError}
                  drivingLicenseClass={drivingLicenseClass}
                  dateOfBirth={patientDateOfBirth}
                  examinationDate={examinationDate}
                  purposeOfExam={purposeOfExam}
                  onContinue={(current, next) => {
                    setCompletedSections(prev => new Set(prev).add(current));
                    
                    console.log('📍 onContinue (DRIVING_VOCATIONAL_TP_LTA):', { current, next, isEditingFromSummary });
                    
                    // Check AMT requirement when navigating to summary (from any section)
                    if (next === 'summary' || isEditingFromSummary) {
                      const newAmtRequired = recalculateAMTRequirement();
                      const oldAmtRequired = formData.amtRequired;
                      
                      console.log('AMT requirement check:', { newAmtRequired, oldAmtRequired });
                      
                      // Update formData.amtRequired if it changed
                      if (newAmtRequired !== null && newAmtRequired !== oldAmtRequired) {
                        setFormData(prev => ({ ...prev, amtRequired: newAmtRequired }));
                        
                        // If AMT newly became required, remove it from completed sections
                        if (newAmtRequired === true && oldAmtRequired === false) {
                          console.log('🔄 AMT became required - clearing completion status');
                          setCompletedSections(prev => {
                            const newSet = new Set(prev);
                            newSet.delete('amt');
                            return newSet;
                          });
                        }
                      }
                      
                      // If AMT is required OR uncertain (null), verify AMT section was completed
                      if (newAmtRequired === true || newAmtRequired === null) {
                        // Check if AMT section was completed (includes current if we're on AMT)
                        const amtSectionCompleted = current === 'amt' || completedSections.has('amt');
                        console.log('AMT section completed?', amtSectionCompleted, 'current:', current, 'has amt:', completedSections.has('amt'));
                        
                        if (!amtSectionCompleted) {
                          // AMT is required/uncertain but section not completed
                          if (newAmtRequired === null) {
                            toast.warning('Please complete the AMT questions to continue.');
                          } else if (newAmtRequired !== oldAmtRequired) {
                            toast.warning('AMT is now required. Please complete the AMT questions.');
                          } else {
                            toast.warning('Please complete the AMT questions before continuing.');
                          }
                          setActiveAccordion('amt');
                          setIsEditingFromSummary(false);
                          return; // Don't navigate to summary
                        }
                      }
                    }
                    
                    if (isEditingFromSummary) {
                      // When editing from summary, go back to summary
                      setActiveAccordion('summary');
                      setIsEditingFromSummary(false);
                    } else if (next === 'summary') {
                      setShowSummary(true);
                      setActiveAccordion(next);
                    } else {
                      setActiveAccordion(next);
                    }
                  }}
                />
              )}

              {/* Driver Exam Details - VOCATIONAL_LICENCE_LTA with flat accordion structure */}
              {examType === 'VOCATIONAL_LICENCE_LTA' && (
                <VocationalLicenceLtaAccordions
                  formData={formData}
                  onChange={handleFormDataChange}
                  completedSections={completedSections}
                  isPatientInfoValid={isPatientInfoValid}
                  errors={{ 
                    medicalDeclarationRemarks: medicalDeclarationRemarksError || '',
                    medicalDeclarationPatientCertification: medicalDeclarationPatientCertificationError || '',
                    ...medicalHistoryErrors,
                    ...abnormalityChecklistErrors
                  }}
                  onValidate={handleValidationError}
                  onContinue={(current, next) => {
                    if (current === 'assessment') {
                      if (validateExamSpecific()) {
                        setCompletedSections(prev => new Set(prev).add(current));
                        setShowSummary(true);
                        setActiveAccordion(next);
                      }
                    } else {
                      setCompletedSections(prev => new Set(prev).add(current));
                      setActiveAccordion(next);
                    }
                  }}
                />
              )}

              {/* Short Driver Exam Form */}
              {isShortDriverExamType(examType) && (
                <DrivingVocationalTpLtaShortAccordions
                  formData={formData}
                  onChange={handleFormDataChange}
                  completedSections={completedSections}
                  isPatientInfoValid={isPatientInfoValid}
                  isEditingFromSummary={isEditingFromSummary}
                  errors={{}}
                  purposeOfExam={purposeOfExam}
                  onContinue={(current, next) => {
                    setCompletedSections(prev => new Set(prev).add(current));
                    if (next === 'summary') {
                      setShowSummary(true);
                    }
                    setActiveAccordion(next);
                  }}
                />
              )}

              {examType === 'SIX_MONTHLY_MDW' && showSummary && (
                <AccordionItem value="summary">
                  <AccordionTrigger isCompleted={completedSections.has('summary')} isDisabled={!isPatientInfoValid || !completedSections.has('exam-specific')}>
                    <div className="flex items-center gap-2">
                      <span>Summary & Declaration</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <SixMonthlyMdwSummary
                        formData={formData}
                        patientName={patientName}
                        patientNric={patientNric}
                        examinationDate={examinationDate}
                        lastRecordedHeight={lastRecordedHeight}
                        lastRecordedWeight={lastRecordedWeight}
                        lastRecordedDate={lastRecordedDate}
                        requiredTests={requiredTests}
                        onEdit={(section) => {
                          // Navigate to the requested section for editing
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                      />
                      
                      <DeclarationSection
                        checked={declarationChecked}
                        onChange={setDeclarationChecked}
                        userRole={role}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
                      />
                      
                      <div className="flex justify-start mt-4">
                        {role === 'doctor' ? (
                          <Button
                            type="button"
                            onClick={() => {
                              if (!declarationChecked) {
                                toast.error('Please check the declaration before submitting');
                                return;
                              }
                              // mark summary completed and open submit dialog for doctors
                              setCompletedSections(prev => new Set(prev).add('summary'));
                              setIsRouteForApproval(false);
                              setShowSubmitDialog(true);
                            }}
                            disabled={!declarationChecked}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit to MOM
                          </Button>
                        ) : role === 'nurse' ? (
                          <Button
                            type="button"
                            onClick={async () => {
                              // For nurses, route for approval from the summary
                              setCompletedSections(prev => new Set(prev).add('summary'));

                              if (!hasDefaultDoctor) {
                                setShowSetDefaultDoctorDialog(true);
                              } else {
                                // If default doctor exists but assignedDoctorId is empty (e.g. editing a draft),
                                // fetch the default doctor id and pre-fill the select before opening dialog.
                                try {
                                  if (!assignedDoctorId) {
                                    const { defaultDoctorId } = await usersApi.getDefaultDoctor();
                                    if (defaultDoctorId) setAssignedDoctorId(defaultDoctorId);
                                  }
                                } catch (e) {
                                  console.error('Failed to fetch default doctor before routing for approval', e);
                                }

                                setIsRouteForApproval(true);
                                setShowSubmitDialog(true);
                              }
                            }}
                            disabled={!isPatientInfoValid || isSaving}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit for Approval
                          </Button>
                        ) : (
                          // Other roles (non-doctor, non-nurse) can continue
                          <Button
                            type="button"
                            onClick={() => {
                              setCompletedSections(prev => new Set(prev).add('summary'));
                              toast.success('All sections completed! You can now save or submit.');
                            }}
                          >
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {examType === 'SIX_MONTHLY_FMW' && showSummary && (
                <AccordionItem value="summary">
                  <AccordionTrigger isCompleted={completedSections.has('summary')} isDisabled={!isPatientInfoValid || !completedSections.has('exam-specific')}>
                    <div className="flex items-center gap-2">
                      <span>Summary & Declaration</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <SixMonthlyFmwSummary
                        formData={formData}
                        patientName={patientName}
                        patientNric={patientNric}
                        examinationDate={examinationDate}
                        requiredTests={requiredTests}
                        onEdit={(section) => {
                          // Navigate to the requested section for editing
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                      />
                      
                      <DeclarationSection
                        checked={declarationChecked}
                        onChange={setDeclarationChecked}
                        userRole={role}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
                      />
                      
                      <div className="flex justify-start mt-4">
                        {role === 'doctor' ? (
                          <Button
                            type="button"
                            onClick={() => {
                              if (!declarationChecked) {
                                toast.error('Please check the declaration before submitting');
                                return;
                              }
                              // mark summary completed and open submit dialog for doctors
                              setCompletedSections(prev => new Set(prev).add('summary'));
                              setIsRouteForApproval(false);
                              setShowSubmitDialog(true);
                            }}
                            disabled={!declarationChecked}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit to MOM
                          </Button>
                        ) : role === 'nurse' ? (
                          <Button
                            type="button"
                            onClick={async () => {
                              // For nurses, route for approval from the summary
                              setCompletedSections(prev => new Set(prev).add('summary'));

                              if (!hasDefaultDoctor) {
                                setShowSetDefaultDoctorDialog(true);
                              } else {
                                // If default doctor exists but assignedDoctorId is empty (e.g. editing a draft),
                                // fetch the default doctor id and pre-fill the select before opening dialog.
                                try {
                                  if (!assignedDoctorId) {
                                    const { defaultDoctorId } = await usersApi.getDefaultDoctor();
                                    if (defaultDoctorId) setAssignedDoctorId(defaultDoctorId);
                                  }
                                } catch (e) {
                                  console.error('Failed to fetch default doctor before routing for approval', e);
                                }

                                setIsRouteForApproval(true);
                                setShowSubmitDialog(true);
                              }
                            }}
                            disabled={!isPatientInfoValid || isSaving}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit for Approval
                          </Button>
                        ) : (
                          // Other roles (non-doctor, non-nurse) can continue
                          <Button
                            type="button"
                            onClick={() => {
                              setCompletedSections(prev => new Set(prev).add('summary'));
                              toast.success('All sections completed! You can now save or submit.');
                            }}
                          >
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {examType === 'FULL_MEDICAL_EXAM' && showSummary && (
                <AccordionItem value="summary">
                  <AccordionTrigger isCompleted={completedSections.has('summary')} isDisabled={!isPatientInfoValid || !completedSections.has('exam-specific')}>
                    <div className="flex items-center gap-2">
                      <span>Summary & Declaration</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <FullMedicalExamSummary
                        formData={formData}
                        gender={formData.gender}
                        patientName={patientName}
                        patientNric={patientNric}
                        examinationDate={examinationDate}
                        onEdit={(section) => {
                          setIsEditingFromSummary(true);
                          setActiveAccordion(section);
                        }}
                      />

                      {/* Overall Result */}
                      <Card className="mt-6 bg-blue-50 border-blue-100">
                        <CardContent className="pt-6">
                          <h4 className="text-lg font-semibold mb-4">Overall Result of Medical Examination</h4>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium mb-3 block">
                                Is this patient fit for work? <span className="text-red-500">*</span>
                              </Label>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="fit-yes-summary"
                                    name="fitForWork-summary"
                                    value="yes"
                                    checked={formData.fitForWork === 'yes'}
                                    onChange={(e) => handleFormDataChange('fitForWork', e.target.value)}
                                    className="w-4 h-4 text-blue-600 cursor-pointer"
                                  />
                                  <Label htmlFor="fit-yes-summary" className="font-normal cursor-pointer">
                                    Yes
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="fit-no-summary"
                                    name="fitForWork-summary"
                                    value="no"
                                    checked={formData.fitForWork === 'no'}
                                    onChange={(e) => handleFormDataChange('fitForWork', e.target.value)}
                                    className="w-4 h-4 text-blue-600 cursor-pointer"
                                  />
                                  <Label htmlFor="fit-no-summary" className="font-normal cursor-pointer">
                                    No
                                  </Label>
                                </div>
                              </div>
                            </div>
                            
                            {formData.fitForWork && (
                              <div className={`p-4 rounded-lg border ${
                                formData.fitForWork === 'yes' 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-red-50 border-red-200'
                              }`}>
                                <p className={`font-semibold ${
                                  formData.fitForWork === 'yes' ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {formData.fitForWork === 'yes' ? '✓' : '✗'} The patient is{' '}
                                  {formData.fitForWork === 'yes' ? 'fit for work' : 'NOT fit for work'}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <DeclarationSection
                        checked={declarationChecked}
                        onChange={setDeclarationChecked}
                        userRole={role}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
                      />
                      
                      <div className="flex justify-start mt-4">
                        {role === 'doctor' ? (
                          <Button
                            type="button"
                            onClick={() => {
                              if (!formData.fitForWork) {
                                toast.error('Please select whether the patient is fit for work');
                                return;
                              }
                              if (!declarationChecked) {
                                toast.error('Please check the declaration before submitting');
                                return;
                              }
                              if (formData.chestXray === 'pending-clearance-ntbcc') {
                                toast.error('Cannot submit while pending NTBCC clearance. Please save as draft and submit after obtaining clearance.');
                                return;
                              }
                              setCompletedSections(prev => new Set(prev).add('summary'));
                              setIsRouteForApproval(false);
                              setShowSubmitDialog(true);
                            }}
                            disabled={!declarationChecked || !formData.fitForWork || formData.chestXray === 'pending-clearance-ntbcc'}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit to MOM
                          </Button>
                        ) : role === 'nurse' ? (
                          <Button
                            type="button"
                            onClick={async () => {
                              if (!formData.fitForWork) {
                                toast.error('Please select whether the patient is fit for work');
                                return;
                              }
                              if (formData.chestXray === 'pending-clearance-ntbcc') {
                                toast.error('Cannot submit while pending NTBCC clearance. Please save as draft and submit after obtaining clearance.');
                                return;
                              }
                              setCompletedSections(prev => new Set(prev).add('summary'));

                              if (!hasDefaultDoctor) {
                                setShowSetDefaultDoctorDialog(true);
                              } else {
                                try {
                                  if (!assignedDoctorId) {
                                    const { defaultDoctorId } = await usersApi.getDefaultDoctor();
                                    if (defaultDoctorId) setAssignedDoctorId(defaultDoctorId);
                                  }
                                } catch (e) {
                                  console.error('Failed to fetch default doctor before routing for approval', e);
                                }

                                setIsRouteForApproval(true);
                                setShowSubmitDialog(true);
                              }
                            }}
                            disabled={!isPatientInfoValid || isSaving || !formData.fitForWork || formData.chestXray === 'pending-clearance-ntbcc'}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit for Approval
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              setCompletedSections(prev => new Set(prev).add('summary'));
                              toast.success('All sections completed! You can now save or submit.');
                            }}
                          >
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {isIcaExamType(examType) && showSummary && (
                <AccordionItem value="summary">
                  <AccordionTrigger isCompleted={completedSections.has('summary')} isDisabled={!isPatientInfoValid || !completedSections.has('exam-specific')}>
                    <div className="flex items-center gap-2">
                      <span>Summary & Declaration</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <IcaExamSummary
                        formData={formData}
                        patientName={patientName}
                        patientNric={patientNric}
                        patientPassportNo={patientPassportNo}
                        patientEmail={patientEmail}
                        examinationDate={examinationDate}
                        onEdit={(section) => {
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                      />
                      
                      <IcaDeclarationSection
                        checked={declarationChecked}
                        onChange={setDeclarationChecked}
                        userRole={role}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
                      />
                      
                      <div className="flex justify-start mt-4">
                        {role === 'doctor' ? (
                          <Button
                            type="button"
                            onClick={() => {
                              if (!declarationChecked) {
                                toast.error('Please check the declaration before submitting');
                                return;
                              }
                              setCompletedSections(prev => new Set(prev).add('summary'));
                              setIsRouteForApproval(false);
                              setShowSubmitDialog(true);
                            }}
                            disabled={!declarationChecked || isSaving}
                          >
                            {isSaving ? 'Submitting...' : 'Submit to ICA'}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              setIsRouteForApproval(true);
                              setShowSubmitDialog(true);
                            }}
                            disabled={isSaving}
                          >
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Driver Medical Exam Summaries */}
              {examType === 'DRIVING_LICENCE_TP' && showSummary && (
                <AccordionItem value="summary">
                  <AccordionTrigger isCompleted={completedSections.has('summary')}>
                    <div className="flex items-center gap-2">
                      <span>Review & Submit</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <DrivingLicenceTpSummary
                        formData={formData}
                        patientInfo={{
                          name: patientName,
                          nric: patientNric,
                          dateOfBirth: patientDateOfBirth,
                          drivingLicenseClass: drivingLicenseClass,
                          email: patientEmail,
                          mobile: patientMobile,
                        }}
                        examinationDate={examinationDate}
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
                        onChange={handleFormDataChange}
                        onEdit={(section) => {
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        userRole={role}
                      />

                      <div className="flex justify-start mt-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setCompletedSections(prev => new Set(prev).add('summary'));
                            if (role === 'doctor') {
                              setIsRouteForApproval(false);
                              setShowSubmitDialog(true);
                            } else {
                              setIsRouteForApproval(true);
                              setShowSubmitDialog(true);
                            }
                          }}
                          disabled={isSaving || !formData.assessment?.declarationAgreed}
                        >
                          {isSaving ? 'Submitting...' : role === 'doctor' ? 'Submit to TP' : 'Route for Approval'}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {examType === 'DRIVING_VOCATIONAL_TP_LTA' && showSummary && (
                <AccordionItem value="summary">
                  <AccordionTrigger isCompleted={completedSections.has('summary')}>
                    <div className="flex items-center gap-2">
                      <span>Review & Submit</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <DrivingVocationalTpLtaSummary
                        formData={formData}
                        patientInfo={{
                          name: patientName,
                          nric: patientNric,
                          dateOfBirth: patientDateOfBirth,
                          drivingLicenseClass: drivingLicenseClass,
                          purposeOfExam: purposeOfExam,
                          email: patientEmail,
                          mobile: patientMobile,
                        }}
                        examinationDate={examinationDate}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
                        onChange={handleFormDataChange}
                        onEdit={(section) => {
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                        userRole={role}
                      />

                      {/* Warning for pending memos */}
                      {hasPendingMemos(examType, formData) && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                                Pending Memo/Report Required
                              </h4>
                              <p className="text-sm text-yellow-700 mb-2">
                                This report cannot be submitted yet. The patient has medical conditions that require additional memo/report to be provided.
                                Please review the highlighted conditions in the Medical Conditions section above.
                              </p>
                              <p className="text-sm text-yellow-700 font-medium">
                                💡 You can save this as a draft and submit later once the patient provides the required memo/report.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-start mt-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setCompletedSections(prev => new Set(prev).add('summary'));
                            if (role === 'doctor') {
                              setIsRouteForApproval(false);
                              setShowSubmitDialog(true);
                            } else {
                              setIsRouteForApproval(true);
                              setShowSubmitDialog(true);
                            }
                          }}
                          disabled={
                            isSaving || 
                            !formData.assessment?.declarationAgreed || 
                            (purposeOfExam === 'BAVL_ANY_AGE' 
                              ? formData.assessment?.fitForBusAttendant === undefined
                              : purposeOfExam === 'AGE_65_ABOVE_TP_ONLY'
                              ? formData.assessment?.fitToDrive === undefined
                              : formData.assessment?.fitToDrivePublicService === undefined) ||
                            hasPendingMemos(examType, formData)
                          }
                        >
                          {isSaving ? 'Submitting...' : role === 'doctor' ? (
                            purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' || purposeOfExam === 'BAVL_ANY_AGE' 
                              ? 'Submit to LTA'
                              : purposeOfExam === 'AGE_65_ABOVE_TP_LTA'
                              ? 'Submit to TP & LTA'
                              : 'Submit to TP'
                          ) : 'Route for Approval'}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {examType === 'VOCATIONAL_LICENCE_LTA' && showSummary && (
                <AccordionItem value="summary">
                  <AccordionTrigger isCompleted={completedSections.has('summary')}>
                    <div className="flex items-center gap-2">
                      <span>Review & Submit</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <VocationalLicenceLtaSummary
                        formData={formData}
                        patientInfo={{
                          name: patientName,
                          nric: patientNric,
                          dateOfBirth: patientDateOfBirth,
                          email: patientEmail,
                          mobile: patientMobile,
                        }}
                        examinationDate={examinationDate}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
                        onEdit={(section) => {
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                        userRole={role}
                      />

                      <div className="flex justify-start mt-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setCompletedSections(prev => new Set(prev).add('summary'));
                            if (role === 'doctor') {
                              setIsRouteForApproval(false);
                              setShowSubmitDialog(true);
                            } else {
                              setIsRouteForApproval(true);
                              setShowSubmitDialog(true);
                            }
                          }}
                          disabled={isSaving || !formData.assessment?.declarationAgreed}
                        >
                          {isSaving ? 'Submitting...' : role === 'doctor' ? 'Submit to LTA' : 'Route for Approval'}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Short Driver Exam Summary */}
              {isShortDriverExamType(examType) && showSummary && (
                <AccordionItem value="summary">
                  <AccordionTrigger isCompleted={completedSections.has('summary')}>
                    <div className="flex items-center gap-2">
                      <span>Review & Submit</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <ShortDriverExamSummary
                        formData={formData}
                        patientInfo={{
                          name: patientName,
                          nric: patientNric,
                          mobile: patientMobile,
                        }}
                        purposeOfExam={purposeOfExam}
                        examinationDate={examinationDate}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
                        userRole={role}
                        onEdit={(section) => {
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                        onDeclarationChange={(checked) => {
                          setFormData(prev => ({ ...prev, declarationAgreed: checked }));
                        }}
                      />

                      <div className="flex justify-start mt-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setCompletedSections(prev => new Set(prev).add('summary'));
                            if (role === 'doctor') {
                              setIsRouteForApproval(false);
                              setShowSubmitDialog(true);
                            } else {
                              setIsRouteForApproval(true);
                              setShowSubmitDialog(true);
                            }
                          }}
                          disabled={
                            isSaving || 
                            !formData.declarationAgreed ||
                            (purposeOfExam === 'BAVL_ANY_AGE' 
                              ? !formData.fitToDrivePsvBavl
                              : purposeOfExam === 'AGE_65_ABOVE_TP_ONLY'
                              ? !formData.fitToDriveMotorVehicle
                              : !formData.fitToDriveMotorVehicle || !formData.fitToDrivePsvBavl)
                          }
                        >
                          {isSaving ? 'Submitting...' : role === 'doctor' ? (
                            examType === 'DRIVING_LICENCE_TP_SHORT' 
                              ? 'Submit to TP'
                              : purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' || purposeOfExam === 'BAVL_ANY_AGE'
                              ? 'Submit to LTA'
                              : purposeOfExam === 'AGE_65_ABOVE_TP_LTA'
                              ? 'Submit to TP & LTA'
                              : 'Submit to TP'
                          ) : 'Route for Approval'}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {examType !== 'SIX_MONTHLY_MDW' && examType !== 'SIX_MONTHLY_FMW' && examType !== 'FULL_MEDICAL_EXAM' && !isIcaExamType(examType) && examType !== 'DRIVING_LICENCE_TP' && examType !== 'DRIVING_VOCATIONAL_TP_LTA' && examType !== 'VOCATIONAL_LICENCE_LTA' && examType !== 'DRIVING_LICENCE_TP_SHORT' && examType !== 'DRIVING_VOCATIONAL_TP_LTA_SHORT' && (
                <AccordionItem value="remarks">
                  <AccordionTrigger isCompleted={completedSections.has('remarks')} isDisabled={!isPatientInfoValid}>
                    <div className="flex items-center gap-2">
                      <span>Additional Remarks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <RemarksField
                      value={formData.remarks || ''}
                      onChange={(value) => handleFormDataChange('remarks', value)}
                    />
                    <div className="flex justify-start mt-4">
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

      {examType && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleSaveDraft} disabled={!examType || isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </Button>

          <div className="flex gap-3">
            {/* Nurses submit for approval from the Summary section only; no footer button here for MDW/FMW. */}
            
            {/* Doctors submit from the Summary section only; no footer button here for MDW/FMW. */}
          </div>
        </div>
      )}

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRouteForApproval ? 'Route for Approval?' : 'Submit Medical Examination?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRouteForApproval 
                ? 'This will send the medical examination to a doctor for review and approval before submission.'
                : user?.role === 'doctor'
                ? 'This will submit the medical examination results to the relevant government agency. This action cannot be undone.'
                : 'This will submit the medical examination results. Please ensure all information is accurate.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {user?.role === 'nurse' && isRouteForApproval && (
            <div className="space-y-2 px-6 pb-4">
              <Label htmlFor="assignedDoctor">Assign to Doctor <span className="text-red-500">*</span></Label>
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

      {/* FIN Change Confirmation Dialog */}
      <AlertDialog open={showFinChangeDialog} onOpenChange={setShowFinChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm FIN Change</AlertDialogTitle>
            <AlertDialogDescription>
              You are changing the FIN to a different patient. All examination data you have entered will be cleared and the new patient's information will be loaded. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              // User cancelled - revert to previous value
              setPatientNric(previousFinValue);
              setPendingFinValue('');
              setShowFinChangeDialog(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              // User confirmed - keep the new FIN (already set in patientNric) and clear accordion data
              setPreviousFinValue(pendingFinValue);
              clearAccordionData();
              
              // Clear patient name to trigger fresh lookup
              setPatientName('');
              setIsNameFromApi(false);
              
              // Reset the lookup ref so the useEffect will fetch for the new FIN
              lastLookedUpNricRef.current = null;
              
              // Set confirmed value to trigger patient lookup
              setConfirmedFinValue(pendingFinValue);
              
              setShowFinChangeDialog(false);
              setPendingFinValue('');
              
              // Don't show toast here - let the useEffect show it when patient is found
            }}>
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
