import { maskName } from './nameMasking';
import type { ExamType, SubmissionStatus } from '../types/api';

/**
 * Determines whether to display a masked name based on exam type and submission status
 * For MDW and FMW exams:
 * - Mask names in draft and pending_approval states
 * - Show full names only when submitted, rejected, or revision_requested
 */
export function getDisplayName(
  fullName: string,
  examType: ExamType | string,
  status?: SubmissionStatus | string
): string {
  // Only mask for MDW and FMW exam types
  const shouldMask = examType === 'SIX_MONTHLY_MDW' || examType === 'SIX_MONTHLY_FMW';
  
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
