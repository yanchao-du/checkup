import { useMemo } from 'react';
import type { ExamType, SubmissionStatus } from '../services';

type UserRole = 'nurse' | 'doctor' | 'admin';

interface SubmissionContext {
  examType: ExamType | '';
  status: SubmissionStatus | null;
  hasId: boolean;
}

interface User {
  role: UserRole;
}

/**
 * Hook to manage submission workflow rules and permissions
 * Centralizes all business logic for submission states and user actions
 */
export const useSubmissionWorkflow = (
  context: SubmissionContext,
  user: User | null
) => {
  const workflow = useMemo(() => {
    const { examType, status, hasId } = context;
    const role = user?.role;

    // Helper: Check if exam type is MOM
    const isMomExam = 
      examType === 'SIX_MONTHLY_MDW' || 
      examType === 'SIX_MONTHLY_FMW' || 
      examType === 'FULL_MEDICAL_EXAM';

    // Helper: Check if exam type is ICA
    const isIcaExam = 
      examType === 'PR_MEDICAL' || 
      examType === 'STUDENT_PASS_MEDICAL' || 
      examType === 'LTVP_MEDICAL';

    // Helper: Check if exam type is driver exam
    const isDriverExam = 
      examType === 'DRIVING_LICENCE_TP' || 
      examType === 'DRIVING_VOCATIONAL_TP_LTA' || 
      examType === 'VOCATIONAL_LICENCE_LTA';

    /**
     * Rule: Can user edit FIN/NRIC?
     * Doctors cannot edit FIN for MOM exams that are pending approval
     */
    const canEditFIN = !(
      role === 'doctor' && 
      isMomExam && 
      status === 'pending_approval'
    );

    /**
     * Rule: Should we show the "Use This" test FIN button?
     * Only show for new submissions (no ID) when FIN is editable
     */
    const canShowTestFIN = !hasId && canEditFIN && isMomExam;

    /**
     * Rule: Is this submission in a read-only state?
     * Submitted, rejected, or no user logged in
     */
    const isReadOnly = 
      status === 'submitted' || 
      status === 'rejected' ||
      !role;

    /**
     * Rule: Can nurse route for approval?
     * Only nurses can route, and only for new/draft submissions
     */
    const canRouteForApproval = 
      role === 'nurse' && 
      (!status || status === 'draft');

    /**
     * Rule: Can doctor submit directly?
     * Doctors can submit pending_approval or draft submissions
     */
    const canDoctorSubmit = 
      role === 'doctor' && 
      (status === 'pending_approval' || status === 'draft' || !status);

    /**
     * Rule: Should we include routeForApproval in submission data?
     * Only for new submissions (creating, not updating)
     */
    const shouldIncludeRouteForApproval = !hasId;

    /**
     * Rule: Can user save as draft?
     * Anyone can save draft unless it's already submitted/rejected
     */
    const canSaveDraft = !isReadOnly;

    /**
     * Rule: Is patient name from API?
     * For MOM exams, name comes from patient lookup API
     */
    const shouldFetchPatientName = isMomExam && !isIcaExam;

    return {
      // Permissions
      canEditFIN,
      canShowTestFIN,
      canRouteForApproval,
      canDoctorSubmit,
      canSaveDraft,
      shouldIncludeRouteForApproval,
      shouldFetchPatientName,
      isReadOnly,
      
      // Context helpers
      isMomExam,
      isIcaExam,
      isDriverExam,
      
      // State indicators
      isPendingApproval: status === 'pending_approval',
      isDraft: status === 'draft' || !status,
      isSubmitted: status === 'submitted',
      isRejected: status === 'rejected',
      isRevisionRequested: status === 'revision_requested',
    };
  }, [context.examType, context.status, context.hasId, user?.role]);

  return workflow;
};
