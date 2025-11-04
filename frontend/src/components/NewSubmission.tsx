import { useState, useEffect, useRef } from 'react';
import { validateNRIC } from '../lib/nric_validator';
import { validateNricOrFin, validateEmail, validateSingaporeMobile } from '../lib/validationRules';
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
import type { ExamType, UserClinic } from '../services';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { InlineError } from './ui/InlineError';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
import { DeclarationSection } from './submission-form/summary/DeclarationSection';
import { IcaDeclarationSection } from './submission-form/summary/IcaDeclarationSection';
import { IcaExamFields } from './submission-form/exam-forms/IcaExamFields';
import { IcaExamSummary } from './submission-form/summary/IcaExamSummary';
import { DrivingLicenceTpAccordions } from './submission-form/accordions/DrivingLicenceTpAccordions';
import { DrivingVocationalTpLtaAccordions } from './submission-form/accordions/DrivingVocationalTpLtaAccordions';
import { VocationalLicenceLtaAccordions } from './submission-form/accordions/VocationalLicenceLtaAccordions';

const examTypes: { value: ExamType; label: string }[] = [
  { value: 'SIX_MONTHLY_MDW', label: 'Six-monthly Medical Exam for Migrant Domestic Worker (MOM)' },
  { value: 'SIX_MONTHLY_FMW', label: 'Six-monthly Medical Exam for Female Migrant Worker (MOM)' },
  { value: 'WORK_PERMIT', label: 'Full Medical Exam for Work Permit (MOM)' },
  { value: 'AGED_DRIVERS', label: 'Medical Exam for Aged Drivers (SPF)' },
  { value: 'PR_MEDICAL', label: 'Medical Examination for Permanent Residency (ICA)' },
  { value: 'STUDENT_PASS_MEDICAL', label: 'Medical Examination for Student Pass (ICA)' },
  { value: 'LTVP_MEDICAL', label: 'Medical Examination for Long Term Visit Pass (ICA)' },
  { value: 'DRIVING_LICENCE_TP', label: 'Driving Licence Medical Examination Report (TP)' },
  { value: 'DRIVING_VOCATIONAL_TP_LTA', label: 'Driving Licence and Vocational Licence (TP & LTA)' },
  { value: 'VOCATIONAL_LICENCE_LTA', label: 'Vocational Licence Medical Examination (LTA)' },
];

// Helper to check if exam type is ICA
const isIcaExamType = (examType: ExamType | ''): boolean => {
  return examType === 'PR_MEDICAL' || examType === 'STUDENT_PASS_MEDICAL' || examType === 'LTVP_MEDICAL';
};

// Helper to check if exam type is a driver medical exam
const isDriverExamType = (examType: ExamType | ''): boolean => {
  return examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA' || examType === 'VOCATIONAL_LICENCE_LTA';
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
  const [nricError, setNricError] = useState<string | null>(null);
  const [patientDateOfBirth, setPatientDateOfBirth] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [medicalDeclarationRemarksError, setMedicalDeclarationRemarksError] = useState<string | null>(null);
  const [medicalDeclarationPatientCertificationError, setMedicalDeclarationPatientCertificationError] = useState<string | null>(null);
  const [medicalHistoryErrors, setMedicalHistoryErrors] = useState<Record<string, string>>({});
  const [abnormalityChecklistErrors, setAbnormalityChecklistErrors] = useState<Record<string, string>>({});
  const [drivingLicenseClass, setDrivingLicenseClass] = useState('');
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
  const [showSummary, setShowSummary] = useState(false);
  const [isEditingFromSummary, setIsEditingFromSummary] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [testFin, setTestFin] = useState<string>('');
  
  // Track last saved state to detect actual changes
  const [lastSavedState, setLastSavedState] = useState<{
    examType: ExamType | '';
    patientName: string;
    patientNric: string;
    patientDateOfBirth: string;
    drivingLicenseClass: string;
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

  // Reset form when refresh parameter is present (navigating to /new-submission from /new-submission)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
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
          setExamType(existing.examType);
          setPatientName(existing.patientName);
          setPatientNric(existing.patientNric);
          setPatientDateOfBirth(existing.patientDateOfBirth);
          setPatientEmail(existing.patientEmail || '');
          setPatientMobile(existing.patientMobile || '');
          setDrivingLicenseClass(existing.drivingLicenseClass || '');
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
          
          // Initialize last saved state when loading existing draft
          setLastSavedState({
            examType: existing.examType,
            patientName: existing.patientName,
            patientNric: existing.patientNric,
            patientDateOfBirth: existing.patientDateOfBirth,
            drivingLicenseClass: existing.drivingLicenseClass || '',
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
        setExamType('');
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
      }
    };

    loadSubmission();
  }, [id, navigate]);

  // Validate driving licence exam timing
  useEffect(() => {
    if ((examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') && 
        patientDateOfBirth && examinationDate && drivingLicenseClass) {
      
      // Check if exam date is before DOB
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
      
      if (!validation.isValid && validation.error) {
        setDrivingLicenceTimingError(validation.error);
      } else {
        setDrivingLicenceTimingError(null);
      }
      
      if (validation.warningMessage) {
        setDrivingLicenceTimingWarning(validation.warningMessage);
      } else {
        setDrivingLicenceTimingWarning(null);
      }
    } else {
      setDrivingLicenceTimingError(null);
      setDrivingLicenceTimingWarning(null);
    }
  }, [examType, patientDateOfBirth, examinationDate, drivingLicenseClass]);

  // Track form changes
  useEffect(() => {
    // If we have a saved state, compare current state with it
    if (lastSavedState) {
      const hasChanges = 
        examType !== lastSavedState.examType ||
        patientName !== lastSavedState.patientName ||
        patientNric !== lastSavedState.patientNric ||
        patientDateOfBirth !== lastSavedState.patientDateOfBirth ||
        drivingLicenseClass !== lastSavedState.drivingLicenseClass ||
        examinationDate !== lastSavedState.examinationDate ||
        JSON.stringify(formData) !== JSON.stringify(lastSavedState.formData);
      
      setHasUnsavedChanges(hasChanges);
    } else {
      // No saved state - mark as changed if any field has data (for new submissions)
      const hasData = !!(examType || patientName || patientNric || patientDateOfBirth || drivingLicenseClass ||
                      examinationDate || Object.keys(formData).length > 0);
      setHasUnsavedChanges(hasData);
    }
  }, [examType, patientName, patientNric, patientDateOfBirth, drivingLicenseClass, examinationDate, formData, setHasUnsavedChanges, lastSavedState]);

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
    const shouldShowTestFin = !id && (examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'WORK_PERMIT');
    
    if (shouldShowTestFin) {
      patientsApi.getRandomTestFin().then((result) => {
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

  // Fetch patient name from API for SIX_MONTHLY_MDW, SIX_MONTHLY_FMW and WORK_PERMIT (but not ICA)
  useEffect(() => {
    const shouldFetchPatientName = 
      !isIcaExamType(examType) &&
      (examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'WORK_PERMIT') &&
      patientNric.length >= 9 && 
      !nricError &&
      !id; // Only auto-fetch for new submissions, not when editing

    if (!shouldFetchPatientName) {
      return;
    }

    const fetchPatientName = async () => {
    
      // Guard: if we've already looked up this NRIC, skip
      if (lastLookedUpNricRef.current === patientNric) {
        console.debug('[NewSubmission] Skipping fetch - NRIC already looked up', { patientNric });
        return;
      }
      setIsLoadingPatient(true);
      try {
        const patient = await patientsApi.getByNric(patientNric);
        if (patient) {
          lastLookedUpNricRef.current = patientNric;
          setPatientName(patient.name);
          setIsNameFromApi(true);
          
          // Set required tests from patient data
          if (patient.requiredTests) {
            setRequiredTests(patient.requiredTests);
            // Save required test flags to formData so they persist when submission is saved
            setFormData(prev => ({
              ...prev,
              hivTestRequired: patient.requiredTests!.hiv ? 'true' : 'false',
              chestXrayRequired: patient.requiredTests!.chestXray ? 'true' : 'false',
            }));
          } else {
            // Default to all tests required if not specified
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
            // Reset to default all tests required
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
  // Note: we intentionally do NOT include formData.height in the deps here.
  // The effect should run when the patient NRIC changes (or examType/id flags),
  // but not when the local height field is edited. Including formData.height
  // caused every height edit to re-trigger the patient lookup API.
  }, [patientNric, examType, nricError, id]);

  const handleFormDataChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleValidationError = (field: string, error: string) => {
    if (field === 'medicalDeclarationRemarks') {
      setMedicalDeclarationRemarksError(error);
    } else if (field === 'medicalDeclarationPatientCertification') {
      setMedicalDeclarationPatientCertificationError(error);
    } else if (field.startsWith('medicalHistory')) {
      // Handle medical history remarks errors
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
    setAbnormalityChecklistErrors({});
  };

  const validatePatientInfo = (): boolean => {
    // Validate NRIC/FIN
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
    
    // Validate Patient Name
    if (!patientName.trim()) {
      toast.error('Patient Name is required');
      return false;
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

    // Validate driving licence exam timing
    if (drivingLicenceTimingError) {
      toast.error(drivingLicenceTimingError);
      return false;
    }
    
    // clear inline exam date error if present
    if (examinationDateError) setExaminationDateError(null);
    if (emailError) setEmailError(null);
    if (mobileError) setMobileError(null);
    if (nricError) setNricError(null);
    return true;
  };

  const validateExamSpecific = (): boolean => {
    
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
    patientNric.trim() &&
    !nricError &&
    patientName.trim() &&
    ((examType === 'AGED_DRIVERS' || isDriverExamType(examType)) ? patientDateOfBirth : true) &&
    ((examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') ? drivingLicenseClass : true) &&
    examinationDate &&
    !examinationDateError &&
    !drivingLicenceTimingError &&
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
          const amtSectionCompleted = completedSections.has('amt');
          console.log('amtSectionCompleted:', amtSectionCompleted);
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

      const submissionData = {
        examType,
        patientName,
        patientNric,
        ...(patientDateOfBirth && { patientDateOfBirth }), // Only include if not empty
        ...(patientEmail && { patientEmail }), // Only include if not empty
        ...(patientMobile && { patientMobile }), // Only include if not empty
        ...(drivingLicenseClass && { drivingLicenseClass }), // Only include if not empty
        ...(examinationDate && { examinationDate }), // Only include if not empty
        formData,
        routeForApproval: false,
        assignedDoctorId: assignedDoctorId || undefined,
        ...(selectedClinicId && { clinicId: selectedClinicId }),
      };

      if (id) {
        // Update existing draft - stay on the same page
        await submissionsApi.update(id, submissionData);
        toast.success('Draft updated successfully');
        // Do not navigate away; remain on the draft edit page
      } else {
        // Create new draft and navigate to its draft edit URL so user stays on the page
        const created = await submissionsApi.create(submissionData);
        toast.success('Draft saved successfully');
        // Navigate to /draft/:id which will load the draft into the form
        navigate(`/draft/${created.id}`, { replace: true });
      }
      
      // Save current state as the last saved state
      setLastSavedState({
        examType,
        patientName,
        patientNric,
        patientDateOfBirth,
        drivingLicenseClass,
        examinationDate,
        formData: JSON.parse(JSON.stringify(formData)), // Deep copy
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

      const submissionData = {
        examType,
        patientName,
        patientNric,
        ...(patientDateOfBirth && { patientDateOfBirth }), // Only include if not empty
        ...(patientEmail && { patientEmail }), // Only include if not empty
        ...(patientMobile && { patientMobile }), // Only include if not empty
        ...(drivingLicenseClass && { drivingLicenseClass }), // Only include if not empty
        ...(examinationDate && { examinationDate }), // Only include if not empty
        formData,
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
            toast.success('Medical exam submitted successfully');
            navigate(`/acknowledgement/${submitted.id}`, { replace: true });
          } else {
            toast.success('Submission updated successfully');
            navigate('/submissions', { replace: true });
          }
      } else {
        // Create new submission
          const created = await submissionsApi.create(submissionData);

          if (user.role === 'doctor' || !isRouteForApproval) {
            toast.success('Medical exam submitted successfully');
            navigate(`/acknowledgement/${created.id}`, { replace: true });
          } else {
            toast.success('Routed for approval successfully');
            navigate(`/acknowledgement/${created.id}`, { replace: true });
          }
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to submit medical exam');
      setHasUnsavedChanges(true); // Restore unsaved changes flag on error
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = examType && patientName && patientNric && 
    ((examType === 'AGED_DRIVERS' || isDriverExamType(examType)) ? patientDateOfBirth : true) &&
    ((examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') ? drivingLicenseClass : true) &&
    (examType === 'SIX_MONTHLY_MDW' ? (!!formData.height && !!formData.weight) : true) &&
    (examType === 'SIX_MONTHLY_FMW' || isIcaExamType(examType) ? true : true);

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

          {/* Clinic Selection - Only show for doctors and nurses */}
          {examType && (user?.role === 'doctor' || user?.role === 'nurse') && clinics.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="clinic">Clinic *</Label>
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId} name="clinic">
                <SelectTrigger id="clinic">
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      <div className="flex flex-col">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patientNric">NRIC / FIN *</Label>
                        {testFin && (
                          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-xs text-blue-700 mb-1">Test FIN available:</p>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono text-blue-900 select-all cursor-pointer px-2 py-1 bg-white rounded border border-blue-300 hover:bg-blue-100 transition-colors">
                                {testFin}
                              </code>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPatientNric(testFin);
                                  toast.success('Test FIN populated');
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
                          onChange={(e) => setPatientNric(e.target.value)}
                          onBlur={(e) => {
                            setNricError(validateNricOrFin(e.target.value, validateNRIC));
                          }}
                          placeholder="S1234567A"
                          className={nricError ? 'border-red-500' : ''}
                        />
                        {nricError && (
                          <InlineError>{nricError}</InlineError>
                        )}
                      </div>
                    </div>
                    {/* Patient Name below NRIC/FIN, with conditional rendering for exam type */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name *</Label>
                      {(examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW' || examType === 'WORK_PERMIT') ? (
                        patientNric.length === 9 && !nricError ? 
                        (
                          <div className="space-y-2">
                            <Input
                              id="patientName"
                              name="patientName"
                              value={isNameFromApi && !id ? maskName(patientName) : patientName}
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder={isLoadingPatient ? "Loading..." : "Enter patient name"}
                              readOnly={isNameFromApi}
                              className={isNameFromApi ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                            />
                            {isNameFromApi && !id && (
                              <p className="text-xs text-slate-600 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 rounded-full bg-green-500"></span>
                                Name retrieved and masked for verification. Full name will be visible after submission.
                              </p>
                            )}
                          </div>
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
                    </div>
                    </div>
                    {(examType === 'AGED_DRIVERS' || isDriverExamType(examType)) && (
                      <DateOfBirthField
                        value={patientDateOfBirth}
                        onChange={setPatientDateOfBirth}
                      />
                    )}
                    {isDriverExamType(examType) && (
                      <>
                        <div className="space-y-2">
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
                            className={emailError ? 'border-red-500' : ''}
                          />
                          {emailError && <InlineError>{emailError}</InlineError>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="patientMobile">Mobile Number</Label>
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
                      </>
                    )}
                    {(examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') && (
                      <DrivingLicenceClassField
                        value={drivingLicenseClass}
                        onChange={setDrivingLicenseClass}
                      />
                    )}
                    {isDriverExamType(examType) && patientDateOfBirth && examinationDate && (
                      <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
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
                    <div className="space-y-2">
                      <Label htmlFor="examinationDate">Examination Date *</Label>
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
                        aria-invalid={!!examinationDateError || (examinationDateBlurred && !!drivingLicenceTimingError)}
                        className={`${examinationDateError || (examinationDateBlurred && drivingLicenceTimingError) ? 'border-red-500 focus:border-red-500 focus-visible:border-red-500 focus:ring-destructive' : ''}`}
                      />
                      {examinationDateError && (
                        <InlineError>{examinationDateError}</InlineError>
                      )}
                      {examinationDateBlurred && drivingLicenceTimingError && (
                        <InlineError>{drivingLicenceTimingError}</InlineError>
                      )}
                      {examinationDateBlurred && !drivingLicenceTimingError && drivingLicenceTimingWarning && (
                        <p className="text-sm text-amber-600">{drivingLicenceTimingWarning}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="button"
                      onClick={() => handleContinue('patient-info', 'exam-specific')}
                      disabled={!isPatientInfoValid}
                    >
                      {isEditingFromSummary ? 'Continue to Summary' : 'Continue'}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Examination Details - hidden for driver exams as they have their own internal structure */}
              {!isDriverExamType(examType) && (
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
                    />
                  )}
                  <div className="flex justify-end mt-4">
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
                        clinicInfo={selectedClinicId ? clinics.find(c => c.id === selectedClinicId) : undefined}
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
                      />
                      
                      <div className="flex justify-end mt-4">
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
                      />
                      
                      <div className="flex justify-end mt-4">
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
                      />
                      
                      <div className="flex justify-end mt-4">
                        {role === 'doctor' ? (
                          <Button
                            type="button"
                            onClick={() => {
                              if (!declarationChecked) {
                                toast.error('Please check the declaration before submitting');
                                return;
                              }
                              handleSubmit();
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
                        onChange={handleFormDataChange}
                        onEdit={(section) => {
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                      />

                      <div className="flex justify-end mt-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setCompletedSections(prev => new Set(prev).add('summary'));
                            if (role === 'doctor') {
                              handleSubmit();
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
                          email: patientEmail,
                          mobile: patientMobile,
                        }}
                        examinationDate={examinationDate}
                        doctorName={user?.name}
                        doctorMcrNumber={user?.mcrNumber}
                        onChange={handleFormDataChange}
                        onEdit={(section) => {
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
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

                      <div className="flex justify-end mt-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setCompletedSections(prev => new Set(prev).add('summary'));
                            if (role === 'doctor') {
                              handleSubmit();
                            } else {
                              setIsRouteForApproval(true);
                              setShowSubmitDialog(true);
                            }
                          }}
                          disabled={
                            isSaving || 
                            !formData.assessment?.declarationAgreed || 
                            formData.assessment?.fitToDrivePublicService === undefined ||
                            hasPendingMemos(examType, formData)
                          }
                        >
                          {isSaving ? 'Submitting...' : role === 'doctor' ? 'Submit to TP & LTA' : 'Route for Approval'}
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
                        onEdit={(section) => {
                          setActiveAccordion(section);
                          setIsEditingFromSummary(true);
                        }}
                      />

                      <div className="flex justify-end mt-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setCompletedSections(prev => new Set(prev).add('summary'));
                            if (role === 'doctor') {
                              handleSubmit();
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

              {examType !== 'SIX_MONTHLY_MDW' && examType !== 'SIX_MONTHLY_FMW' && !isIcaExamType(examType) && examType !== 'DRIVING_LICENCE_TP' && examType !== 'DRIVING_VOCATIONAL_TP_LTA' && examType !== 'VOCATIONAL_LICENCE_LTA' && (
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

      {examType && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleSaveDraft} disabled={!isFormValid || isSaving}>
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
