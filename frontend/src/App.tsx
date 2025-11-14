import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './components/LoginPage';
import { CorpPassCallback } from './components/CorpPassCallback';
import { AuthError } from './components/AuthError';
import { SessionRevoked } from './pages/SessionRevoked';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { NewSubmission } from './components/NewSubmission';
import { SubmissionsList } from './components/SubmissionsList';
import { DraftsList } from './components/DraftsList';
import { PendingApprovals } from './components/PendingApprovals';
import { RejectedSubmissions } from './components/RejectedSubmissions';
import { ViewSubmission } from './components/ViewSubmission';
import { Acknowledgement } from './components/Acknowledgement';
import { Settings } from './components/Settings';
import Help from './pages/Help';
import { AuthProvider, useAuth } from './components/AuthContext';
import { UnsavedChangesProvider } from './components/UnsavedChangesContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function RoleProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: ('doctor' | 'nurse' | 'admin')[];
}) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Router>
      <UnsavedChangesProvider>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/auth/corppass/callback" element={<CorpPassCallback />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/session-revoked" element={<SessionRevoked />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/new-submission" element={<NewSubmission />} />
                  <Route path="/submissions" element={<SubmissionsList />} />
                  <Route path="/drafts" element={<DraftsList />} />
                  <Route 
                    path="/pending-approvals" 
                    element={
                      <RoleProtectedRoute allowedRoles={['doctor', 'admin']}>
                        <PendingApprovals />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/rejected-submissions" 
                    element={
                      <RoleProtectedRoute allowedRoles={['doctor', 'nurse', 'admin']}>
                        <RejectedSubmissions />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <RoleProtectedRoute allowedRoles={['nurse', 'admin']}>
                        <Settings />
                      </RoleProtectedRoute>
                    } 
                  />
                  {/* Legacy route for user management - redirects to settings */}
                  <Route 
                    path="/user-management" 
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <Settings />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route path="/view-submission/:id" element={<ViewSubmission />} />
                  <Route path="/acknowledgement/:id" element={<Acknowledgement />} />
                  <Route path="/draft/:id" element={<NewSubmission />} />
                  <Route path="/help" element={<Help />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
      </UnsavedChangesProvider>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
