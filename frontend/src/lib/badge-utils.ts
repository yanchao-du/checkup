/**
 * Utility functions for badge styling across the application
 */

export type SubmissionStatus = 'draft' | 'pending_approval' | 'submitted' | 'rejected';
export type UserStatus = 'active' | 'inactive';

/**
 * Get Tailwind classes for submission status badges
 * Returns consistent color schemes for better visual cues
 * Note: Use without variant prop for custom colors to work
 */
/**
 * Get the appropriate badge variant for a submission status
 */
export function getSubmissionStatusBadgeVariant(status: string): 
  | "success" 
  | "warning" 
  | "error" 
  | "inactive" 
  | "default" {
  if (!status) return "default";
  
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'submitted':
    case 'approved':
      return "success";
    case 'pending_approval':
    case 'routed_for_approval':
      return "warning";
    case 'rejected':
      return "error";
    case 'draft':
      return "inactive";
    default:
      return "default";
  }
}

/**
 * Get the appropriate badge variant for a user status
 */
export function getUserStatusBadgeVariant(status: string): 
  | "success" 
  | "inactive" 
  | "default" {
  if (!status) return "default";
  
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'active':
      return "success";
    case 'inactive':
      return "inactive";
    default:
      return "default";
  }
}

/**
 * Get Tailwind classes for user status badges
 */
export function getUserStatusBadgeClass(status: string): string {
  const baseClasses = 'border font-medium';
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case 'active':
      return `${baseClasses} bg-green-50 text-green-700 border-green-300`;
    case 'inactive':
      return `${baseClasses} bg-slate-100 text-slate-700 border-slate-300`;
    default:
      return `${baseClasses} bg-slate-100 text-slate-700 border-slate-300`;
  }
}

/**
 * Get human-readable label for submission status
 */
export function getSubmissionStatusLabel(status: string): string {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case 'draft':
      return 'Draft';
    case 'pending_approval':
      return 'Pending Approval';
    case 'submitted':
      return 'Submitted';
    case 'rejected':
      return 'Rejected';
    default:
      // Return capitalized version of whatever was passed
      return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  }
}

/**
 * Get human-readable label for user status
 */
export function getUserStatusLabel(status: string): string {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    default:
      return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown';
  }
}
