// Export all API services from a central location
export { authApi } from './auth.service';
export { submissionsApi } from './submissions.service';
export { approvalsApi } from './approvals.service';
export { usersApi } from './users.service';
export { clinicsApi } from './clinics.service';

// Re-export API client for direct use if needed
export { apiClient } from '../lib/api-client';

// Re-export types for convenience
export type * from '../types/api';
