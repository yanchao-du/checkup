import { maskName } from './nameMasking';
import type { ExamType, SubmissionStatus } from '../types/api';

/**
 * Determines whether to display a masked name based on exam type and submission status
 * For MDW, FMW, WORK_PERMIT, and FULL_MEDICAL_EXAM exams:
 * - Mask names in draft, pending_approval, rejected, and revision_requested states
 * - Show full names only when submitted to the government agency
 */
export function getDisplayName(
  fullName: string,
  examType: ExamType | string,
  status?: SubmissionStatus | string
): string {
  // Only mask for MDW, FMW, WORK_PERMIT, and FULL_MEDICAL_EXAM exam types
  const shouldMask = examType === 'SIX_MONTHLY_MDW' || 
                     examType === 'SIX_MONTHLY_FMW' || 
                     examType === 'WORK_PERMIT' || 
                     examType === 'FULL_MEDICAL_EXAM';
  
  if (!shouldMask) {
    return fullName;
  }
  
  // If no status provided (e.g., on NewSubmission form), mask the name
  if (!status) {
    return maskName(fullName);
  }
  
  // Show full name only when submitted
  // Mask for: draft, pending_approval, rejected, revision_requested
  const shouldShowFullName = status === 'submitted';
  
  return shouldShowFullName ? fullName : maskName(fullName);
}
