import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { NewSubmission } from './components/NewSubmission';
import { SubmissionsList } from './components/SubmissionsList';
import { DraftsList } from './components/DraftsList';
import { PendingApprovals } from './components/PendingApprovals';
import { UserManagement } from './components/UserManagement';
import { ViewSubmission } from './components/ViewSubmission';
import { AuthProvider, useAuth } from './components/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/new-submission" element={<NewSubmission />} />
                  <Route path="/submissions" element={<SubmissionsList />} />
                  <Route path="/drafts" element={<DraftsList />} />
                  <Route path="/pending-approvals" element={<PendingApprovals />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/submission/:id" element={<ViewSubmission />} />
                  <Route path="/draft/:id" element={<NewSubmission />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
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
