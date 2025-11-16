import { useAuth } from './AuthContext';
import { formatExamType, formatExamTypeFull } from '../lib/formatters';
import { getDisplayName } from '../lib/nameDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FileEdit, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { submissionsApi, approvalsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { toast } from 'sonner';
import { FavoritesManager } from './FavoritesManager';

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

        // Fetch pending approvals if user is a doctor or admin
        if (user?.role === 'doctor' || user?.role === 'admin') {
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
      activityType: 'draft' | 'reopened' | 'pending_approval' | 'approved' | 'rejected' | 'submitted';
      activityDate: Date;
    };

    const activities: Activity[] = [];

    // Add drafts (distinguish between new drafts and reopened rejected submissions)
    drafts.forEach(draft => {
      activities.push({
        ...draft,
        activityType: draft.rejectedReason ? 'reopened' : 'draft',
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
      case 'reopened':
        return { Icon: FileEdit, bgColor: 'bg-purple-50', iconColor: 'text-purple-600' };
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

  const getActivityLabel = (activityType: string, userRole?: string) => {
    switch (activityType) {
      case 'draft':
        return 'Draft Created';
      case 'reopened':
        return 'Reopened';
      case 'pending_approval':
        return userRole === 'doctor' ? 'Pending Your Approval' : 'Pending Approval';
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
        <h2 className="text-slate-900 mb-1 text-2xl font-semibold">Hello, {user?.name}</h2>
        <p className="text-slate-600">
          {user?.role === 'admin' ? "Here's an overview of all medical examination reports" : "Here's an overview of medical examination reports"}
        </p>
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
                  {rejectedSubmissions.length} Rejected Report{rejectedSubmissions.length !== 1 ? 's' : ''}
                </CardTitle>
                <CardDescription className="text-red-700">
                  {rejectedSubmissions.length === 1 
                    ? 'You have a report that was rejected by doctor and needs attention'
                    : 'You have reports that were rejected by doctor and need attention'}
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
                    <p className="font-medium text-slate-900">{getDisplayName(submission.patientName, submission.examType, submission.status)}</p>
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
                        {reopeningId === submission.id ? 'Reopening...' : 'Reopen'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {rejectedSubmissions.length > 3 && (
                <Link to="/rejected-submissions">
                  <Button variant="link" className="w-full text-red-700 hover:text-red-800">
                    View all {rejectedSubmissions.length} reports rejected by doctor →
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

            {/* Pending Approvals Alert for Doctors */}
      {user?.role === 'doctor' && pendingApprovals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-orange-900">Action Required</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              You have {pendingApprovals.length} report(s) waiting for your approval
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

      {/* Figma-style Stats Cards - Horizontal Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <Card className="px-4 py-4 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl text-slate-900">{submissions.length}</span>
              <span className="text-xs text-slate-500 truncate">All Reports</span>
            </div>
          </div>
        </Card>

        {/* Pending Approvals (for doctors and admin) or Submitted (for nurses) */}
        {user?.role === 'doctor' || user?.role === 'admin' ? (
          <Card className="px-4 py-4 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-2xl text-slate-900">{pendingApprovals.length}</span>
                <span className="text-xs text-slate-500 truncate">Pending Approval</span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="px-4 py-4 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-2xl text-slate-900">{submissions.filter(s => s.status === 'submitted').length}</span>
                <span className="text-xs text-slate-500 truncate">Approved & Sent</span>
              </div>
            </div>
          </Card>
        )}

        {/* Drafts */}
        <Card className="px-4 py-4 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
              <FileEdit className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl text-slate-900">{drafts.length}</span>
              <span className="text-xs text-slate-500 truncate">Drafts</span>
            </div>
          </div>
        </Card>

        {/* Rejected */}
        <Card className="px-4 py-4 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl text-slate-900">{rejectedSubmissions.length}</span>
              <span className="text-xs text-slate-500 truncate">
                {user?.role === 'doctor' ? 'Rejected by Me' : 'Rejected by Doctor'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Recent Activity (Left) and Quick Actions + Favorites (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
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
                  // Doctors should see reopened submissions in read-only mode (only nurses can edit reopened)
                  const linkPath = activity.activityType === 'draft'
                    ? `/draft/${activity.id}` 
                    : activity.activityType === 'reopened' && user?.role === 'doctor'
                    ? `/view-submission/${activity.id}`
                    : activity.activityType === 'reopened'
                    ? `/draft/${activity.id}`
                    : `/view-submission/${activity.id}`;
                  
                  return (
                    <div 
                      key={activity.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors gap-3"
                    >
                      <Link to={linkPath} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 flex-shrink-0 ${bgColor} rounded flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-900 truncate">{getDisplayName(activity.patientName, activity.examType, activity.status)}</p>
                          <p className="text-sm text-slate-500 truncate">{formatExamType(activity.examType)}</p>
                        </div>
                      </Link>
                      <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-medium text-slate-900">{getActivityLabel(activity.activityType, user?.role)}</p>
                          {activity.activityType === 'approved' && activity.approvedByName && activity.approvedById !== user?.id && (
                            <p className="text-xs text-slate-500">by {activity.approvedByName}</p>
                          )}
                          {activity.activityType === 'rejected' && activity.approvedByName && activity.approvedById !== user?.id && (
                            <p className="text-xs text-slate-500">by {activity.approvedByName}</p>
                          )}
                          {(activity.activityType === 'draft' || activity.activityType === 'reopened' || activity.activityType === 'pending_approval' || activity.activityType === 'submitted') && activity.createdByName && activity.createdById !== user?.id && (
                            <p className="text-xs text-slate-500">by {activity.createdByName}</p>
                          )}
                        </div>
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                          {activity.activityDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions + Favorites Manager - Takes 1 column */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and favorites</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
            {user?.role === 'admin' ? (
              <>
                <Link to="/settings?tab=users" className="block">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-blue-200 hover:border-teal-300 hover:bg-blue-50 transition-all cursor-pointer group">
                    <div className="bg-blue-100 group-hover:bg-blue-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">User Management</p>
                      <p className="text-xs text-slate-500">Manage users and staff</p>
                    </div>
                  </div>
                </Link>
                <Link to="/settings?tab=clinics" className="block">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer group">
                    <div className="bg-green-100 group-hover:bg-green-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Clinic Management</p>
                      <p className="text-xs text-slate-500">Manage clinics and locations</p>
                    </div>
                  </div>
                </Link>
                <Link to="/settings?tab=doctor-assignments" className="block">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-amber-200 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer group">
                    <div className="bg-amber-100 group-hover:bg-amber-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                      <FileEdit className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Doctor Assignment</p>
                      <p className="text-xs text-slate-500">Assign doctors to clinics</p>
                    </div>
                  </div>
                </Link>
                <Link to="/settings?tab=nurse-assignments" className="block">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group">
                    <div className="bg-purple-100 group-hover:bg-purple-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                      <FileEdit className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Nurse/Assistant Assignment</p>
                      <p className="text-xs text-slate-500">Assign nurses/assistants to clinics</p>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                {/* Regular Quick Actions - Reordered priority */}
                {user?.role === 'nurse' && rejectedSubmissions.length > 0 && (
                  <Link to="/rejected-submissions" className="block">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-red-200 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer group">
                      <div className="bg-red-100 group-hover:bg-red-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Review Rejected</p>
                        <p className="text-xs text-slate-500">{rejectedSubmissions.length} {rejectedSubmissions.length === 1 ? 'item' : 'items'} need attention</p>
                      </div>
                    </div>
                  </Link>
                )}
                {user?.role === 'doctor' && pendingApprovals.length > 0 && (
                  <Link to="/pending-approvals" className="block">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer group">
                      <div className="bg-orange-100 group-hover:bg-orange-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                        <CheckCircle className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Review & Approve</p>
                        <p className="text-xs text-slate-500">{pendingApprovals.length} pending {pendingApprovals.length === 1 ? 'approval' : 'approvals'}</p>
                      </div>
                    </div>
                  </Link>
                )}
                {drafts.length > 0 && (
                  <Link to="/drafts" className="block">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer group">
                      <div className="bg-amber-100 group-hover:bg-amber-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                        <FileEdit className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Continue Draft</p>
                        <p className="text-xs text-slate-500">{drafts.length} incomplete {drafts.length === 1 ? 'draft' : 'drafts'}</p>
                      </div>
                    </div>
                  </Link>
                )}
                {(user?.role === 'doctor' || user?.role === 'nurse') && (
                  <>
                    <Link to="/new-submission" className="block">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-blue-50 transition-all cursor-pointer group">
                        <div className="bg-blue-100 group-hover:bg-blue-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">New Report</p>
                          <p className="text-xs text-slate-500">Select exam type and create</p>
                        </div>
                      </div>
                    </Link>

                    {/* Favorite Exam Types Section - Quick links to favorites */}
                    {user?.favoriteExamTypes && user.favoriteExamTypes.length > 0 && (
                      <>
                        <div className="px-2 py-1">
                          <p className="text-xs text-slate-500 italic">Or go directly to your favorites:</p>
                        </div>
                        {user.favoriteExamTypes.map((examType) => (
                          <div
                            key={examType}
                            onClick={() => navigate(`/new-submission?examType=${examType}`)}
                            className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer group"
                          >
                            <div className="bg-green-100 group-hover:bg-green-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                              <Star className="w-4 h-4 text-green-600 fill-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{formatExamTypeFull(examType as any)}</p>
                              <p className="text-xs text-slate-500">Start immediately</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

          {/* Favorites Manager */}
          {(user?.role === 'doctor' || user?.role === 'nurse') && (
            <FavoritesManager />
          )}
        </div>
      </div>


    </div>
  );
}
