import { useAuth } from './AuthContext';
import { formatExamType } from '../lib/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FileEdit, 
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  Send
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { submissionsApi, approvalsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { toast } from 'sonner';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<MedicalSubmission[]>([]);
  const [drafts, setDrafts] = useState<MedicalSubmission[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<MedicalSubmission[]>([]);
  const [rejectedSubmissions, setRejectedSubmissions] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reopeningId, setReopeningId] = useState<string | null>(null);

  const handleReopenAndFix = async (submissionId: string) => {
    try {
      setReopeningId(submissionId);
      await submissionsApi.reopenSubmission(submissionId);
      toast.info('Submission reopened - redirecting to edit page...');
      
      // Navigate directly to edit page
      navigate(`/draft/${submissionId}`);
    } catch (error) {
      console.error('Failed to reopen submission:', error);
      toast.error('Failed to reopen submission');
      setReopeningId(null);
    }
  };

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

          // Fetch rejected submissions for doctors
          const rejectedResponse = await approvalsApi.getRejected({ 
            page: 1, 
            limit: 100 
          });
          setRejectedSubmissions(rejectedResponse.data);
        }

        // Fetch rejected submissions for nurses
        if (user?.role === 'nurse') {
          const rejectedResponse = await submissionsApi.getRejected({ 
            page: 1, 
            limit: 100 
          });
          setRejectedSubmissions(rejectedResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.role]);

  // Combine all activities for doctors
  const getRecentActivities = () => {
    type Activity = MedicalSubmission & { 
      activityType: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'submitted';
      activityDate: Date;
    };

    const activities: Activity[] = [];

    // Add drafts
    drafts.forEach(draft => {
      activities.push({
        ...draft,
        activityType: 'draft',
        activityDate: new Date(draft.createdDate),
      });
    });

    // Add submissions by status
    submissions.forEach(submission => {
      let activityType: 'pending_approval' | 'approved' | 'rejected' | 'submitted' = 'submitted';
      
      if (submission.status === 'pending_approval') {
        activityType = 'pending_approval';
      } else if (submission.status === 'submitted' && submission.approvedByName) {
        activityType = 'approved'; // Doctor approved and submitted to agency
      } else if (submission.status === 'rejected') {
        activityType = 'rejected';
      }

      activities.push({
        ...submission,
        activityType,
        activityDate: new Date(submission.submittedDate || submission.approvedDate || submission.createdDate),
      });
    });

    // Add rejected submissions for doctors (if not already included)
    if (user?.role === 'doctor') {
      rejectedSubmissions.forEach(rejected => {
        // Only add if not already in submissions list
        if (!activities.find(a => a.id === rejected.id)) {
          activities.push({
            ...rejected,
            activityType: 'rejected',
            activityDate: new Date(rejected.createdDate),
          });
        }
      });
    }

    // Sort by date, most recent first
    return activities.sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime()).slice(0, 10);
  };

  const recentActivities = getRecentActivities();

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'draft':
        return { Icon: FileEdit, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' };
      case 'pending_approval':
        return { Icon: AlertCircle, bgColor: 'bg-orange-50', iconColor: 'text-orange-600' };
      case 'approved':
        return { Icon: CheckCircle, bgColor: 'bg-green-50', iconColor: 'text-green-600' };
      case 'rejected':
        return { Icon: XCircle, bgColor: 'bg-red-50', iconColor: 'text-red-600' };
      case 'submitted':
        return { Icon: Send, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' };
      default:
        return { Icon: FileText, bgColor: 'bg-gray-50', iconColor: 'text-gray-600' };
    }
  };

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case 'draft':
        return 'Draft Created';
      case 'pending_approval':
        return 'Pending Approval';
      case 'approved':
        return 'Approved & Submitted';
      case 'rejected':
        return 'Rejected';
      case 'submitted':
        return 'Submitted';
      default:
        return activityType;
    }
  };

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

      {/* Rejected Submissions Alert - For Nurses */}
      {user?.role === 'nurse' && rejectedSubmissions.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-red-900">
                  {rejectedSubmissions.length} Rejected Submission{rejectedSubmissions.length !== 1 ? 's' : ''}
                </CardTitle>
                <CardDescription className="text-red-700">
                  {rejectedSubmissions.length === 1 
                    ? 'You have a submission that was rejected and needs attention'
                    : 'You have submissions that were rejected and need attention'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rejectedSubmissions.slice(0, 3).map((submission) => (
                <div 
                  key={submission.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{submission.patientName}</p>
                    <p className="text-sm text-slate-600">{formatExamType(submission.examType)}</p>
                    {submission.rejectedReason && (
                      <p className="text-xs text-red-600 mt-1">
                        <span className="font-medium">Reason:</span> {submission.rejectedReason}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/view-submission/${submission.id}`}>
                      <Button variant="outline" size="sm" className="text-slate-600">
                        View
                      </Button>
                    </Link>
                    {submission.status === 'rejected' && (
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleReopenAndFix(submission.id)}
                        disabled={reopeningId === submission.id}
                      >
                        {reopeningId === submission.id ? 'Reopening...' : 'Reopen & Fix'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {rejectedSubmissions.length > 3 && (
                <Link to="/rejected-submissions">
                  <Button variant="link" className="w-full text-red-700 hover:text-red-800">
                    View all {rejectedSubmissions.length} rejected submissions →
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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

        {user?.role === 'nurse' && rejectedSubmissions.length > 0 && (
          <Link to="/rejected-submissions">
            <Card className="border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-red-900">Rejected</CardTitle>
                <XCircle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-red-900 font-semibold">{rejectedSubmissions.length}</div>
                <p className="text-xs text-red-700 mt-1">Needs attention</p>
              </CardContent>
            </Card>
          </Link>
        )}

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
          {user?.role === 'nurse' && rejectedSubmissions.length > 0 && (
            <Link to="/rejected-submissions">
              <Button className="bg-red-600 hover:bg-red-700">
                <XCircle className="w-4 h-4 mr-2" />
                Review Rejected ({rejectedSubmissions.length})
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No recent activity</p>
              {(user?.role === 'doctor' || user?.role === 'nurse') && (
                <Link to="/new-submission">
                  <Button variant="link" className="mt-2">Create your first submission</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const { Icon, bgColor, iconColor } = getActivityIcon(activity.activityType);
                const linkPath = activity.activityType === 'draft' 
                  ? `/draft/${activity.id}` 
                  : `/view-submission/${activity.id}`;
                
                return (
                  <Link 
                    key={activity.id} 
                    to={linkPath}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${bgColor} rounded flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-slate-900">{activity.patientName}</p>
                        <p className="text-sm text-slate-500">{formatExamType(activity.examType)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{getActivityLabel(activity.activityType)}</p>
                        {activity.activityType === 'approved' && activity.approvedByName && (
                          <p className="text-xs text-slate-500">by {activity.approvedByName}</p>
                        )}
                        {activity.activityType === 'rejected' && activity.approvedByName && (
                          <p className="text-xs text-slate-500">by {activity.approvedByName}</p>
                        )}
                      </div>
                      <span className="text-sm text-slate-500">
                        {activity.activityDate.toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                );
              })}
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
