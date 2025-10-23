import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  FileEdit, 
  CheckCircle, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { submissionsApi, approvalsApi } from '../services';
import type { MedicalSubmission } from '../services';

export function Dashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<MedicalSubmission[]>([]);
  const [drafts, setDrafts] = useState<MedicalSubmission[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all submissions (not drafts)
        const submissionsResponse = await submissionsApi.getAll({ 
          page: 1, 
          limit: 100 
        });
        setSubmissions(submissionsResponse.data.filter(s => s.status !== 'draft'));

        // Fetch drafts
        const draftsResponse = await submissionsApi.getDrafts({ 
          page: 1, 
          limit: 100 
        });
        setDrafts(draftsResponse.data);

        // Fetch pending approvals if user is a doctor
        if (user?.role === 'doctor') {
          const approvalsResponse = await approvalsApi.getPending({ 
            page: 1, 
            limit: 100 
          });
          setPendingApprovals(approvalsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.role]);

  const thisMonthSubmissions = submissions.filter(s => {
    const date = new Date(s.submittedDate || s.createdDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main">
      <div>
        <h2 className="text-slate-900 mb-1">Welcome, {user?.email}</h2>
        <p className="text-slate-600">Here's an overview of your medical exam submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Total Submissions</CardTitle>
            <FileText className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{submissions.length}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Drafts</CardTitle>
            <FileEdit className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{drafts.length}</div>
            <p className="text-xs text-slate-500 mt-1">Pending completion</p>
          </CardContent>
        </Card>

        {user?.role === 'doctor' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-slate-600">Pending Approvals</CardTitle>
              <CheckCircle className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-slate-900">{pendingApprovals.length}</div>
              <p className="text-xs text-slate-500 mt-1">Requires your review</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">This Month</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{thisMonthSubmissions}</div>
            <p className="text-xs text-slate-500 mt-1">Submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {(user?.role === 'doctor' || user?.role === 'nurse') && (
            <Link to="/new-submission">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                New Submission
              </Button>
            </Link>
          )}
          {user?.role === 'doctor' && pendingApprovals.length > 0 && (
            <Link to="/pending-approvals">
              <Button variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                Review Approvals ({pendingApprovals.length})
              </Button>
            </Link>
          )}
          {drafts.length > 0 && (
            <Link to="/drafts">
              <Button variant="outline">
                <FileEdit className="w-4 h-4 mr-2" />
                Continue Draft ({drafts.length})
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your latest medical exam submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No submissions yet</p>
              {(user?.role === 'doctor' || user?.role === 'nurse') && (
                <Link to="/new-submission">
                  <Button variant="link" className="mt-2">Create your first submission</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((submission: MedicalSubmission) => (
                <Link 
                  key={submission.id} 
                  to={`/submission/${submission.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-900">{submission.patientName}</p>
                      <p className="text-sm text-slate-500">{submission.examType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      submission.status === 'submitted' ? 'default' :
                      submission.status === 'pending_approval' ? 'secondary' :
                      'outline'
                    }>
                      {submission.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {new Date(submission.submittedDate || submission.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
              {submissions.length > 5 && (
                <Link to="/submissions">
                  <Button variant="link" className="w-full">View all submissions</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals Alert for Doctors */}
      {user?.role === 'doctor' && pendingApprovals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-orange-900">Action Required</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              You have {pendingApprovals.length} submission(s) waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/pending-approvals">
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
