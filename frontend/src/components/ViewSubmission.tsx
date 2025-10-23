import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { approvalsApi } from '../services/approvals.service';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, FileText, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export function ViewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [submissionData, historyData] = await Promise.all([
          submissionsApi.getById(id),
          submissionsApi.getHistory(id).catch(() => null) // History is optional
        ]);
        setSubmission(submissionData);
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch submission:', error);
        toast.error('Failed to load submission details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await approvalsApi.approve(id, { notes: approvalNotes || undefined });
      toast.success('Submission approved successfully');
      setShowApproveDialog(false);
      // Refresh submission data
      const submissionData = await submissionsApi.getById(id);
      setSubmission(submissionData);
      // Optionally navigate back to pending approvals
      setTimeout(() => navigate('/pending-approvals'), 1000);
    } catch (error) {
      console.error('Failed to approve submission:', error);
      toast.error('Failed to approve submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectionReason.trim()) {
      toast.warning('Please provide a reason for rejection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await approvalsApi.reject(id, { reason: rejectionReason });
      toast.success('Submission rejected');
      setShowRejectDialog(false);
      // Refresh submission data
      const submissionData = await submissionsApi.getById(id);
      setSubmission(submissionData);
      // Optionally navigate back to pending approvals
      setTimeout(() => navigate('/pending-approvals'), 1000);
    } catch (error) {
      console.error('Failed to reject submission:', error);
      toast.error('Failed to reject submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
        <p className="text-slate-600">Loading submission...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Submission not found</p>
        <Button onClick={() => navigate('/submissions')} className="mt-4">
          Back to Submissions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-slate-900 mb-1">Medical Exam Details</h2>
          <p className="text-slate-600">View submission information</p>
        </div>
        <Badge
          variant={
            submission.status === 'submitted' ? 'default' :
            submission.status === 'pending_approval' ? 'secondary' :
            'outline'
          }
          className="text-sm px-3 py-1"
        >
          {submission.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Patient Name</p>
                  <p className="text-slate-900">{submission.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">NRIC / FIN</p>
                  <p className="text-slate-900">{submission.patientNric}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                  <p className="text-slate-900">
                    {new Date(submission.patientDateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Examination Date</p>
                  <p className="text-slate-900">
                    {submission.examinationDate 
                      ? new Date(submission.examinationDate).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Exam Type</p>
                <p className="text-slate-900 text-sm">
                  {submission.examType === 'SIX_MONTHLY_MDW' && 'Six-monthly Medical Exam for Migrant Domestic Workers'}
                  {submission.examType === 'WORK_PERMIT' && 'Full Medical Exam for Work Permit'}
                  {submission.examType === 'AGED_DRIVERS' && 'Medical Exam for Aged Drivers'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Examination Results</CardTitle>
              <CardDescription>{submission.examType}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {submission.formData.height && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Height</p>
                    <p className="text-slate-900">{submission.formData.height} cm</p>
                  </div>
                )}
                {submission.formData.weight && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Weight</p>
                    <p className="text-slate-900">{submission.formData.weight} kg</p>
                  </div>
                )}
                {submission.formData.bloodPressure && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Blood Pressure</p>
                    <p className="text-slate-900">{submission.formData.bloodPressure}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Exam type specific fields */}
              {submission.examType === 'SIX_MONTHLY_MDW' && (
                <div className="grid grid-cols-2 gap-4">
                  {submission.formData.pregnancyTest && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Pregnancy Test</p>
                      <p className="text-slate-900">{submission.formData.pregnancyTest}</p>
                    </div>
                  )}
                  {submission.formData.chestXray && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Chest X-Ray</p>
                      <p className="text-slate-900">{submission.formData.chestXray}</p>
                    </div>
                  )}
                </div>
              )}

              {submission.examType === 'WORK_PERMIT' && (
                <div className="grid grid-cols-2 gap-4">
                  {submission.formData.hivTest && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">HIV Test</p>
                      <p className="text-slate-900">{submission.formData.hivTest}</p>
                    </div>
                  )}
                  {submission.formData.tbTest && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">TB Test</p>
                      <p className="text-slate-900">{submission.formData.tbTest}</p>
                    </div>
                  )}
                </div>
              )}

              {submission.examType === 'AGED_DRIVERS' && (
                <div className="grid grid-cols-2 gap-4">
                  {submission.formData.visualAcuity && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Visual Acuity</p>
                      <p className="text-slate-900">{submission.formData.visualAcuity}</p>
                    </div>
                  )}
                  {submission.formData.hearingTest && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Hearing Test</p>
                      <p className="text-slate-900">{submission.formData.hearingTest}</p>
                    </div>
                  )}
                  {submission.formData.diabetes && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Diabetes</p>
                      <p className="text-slate-900">{submission.formData.diabetes}</p>
                    </div>
                  )}
                </div>
              )}

              {submission.formData.remarks && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Additional Remarks</p>
                    <p className="text-slate-900">{submission.formData.remarks}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {submission.status === 'submitted' && (
            <Card>
              <CardHeader>
                <CardTitle>Agency Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Submitted To</p>
                    <p className="text-slate-900">
                      {submission.examType === 'AGED_DRIVERS' 
                        ? 'Singapore Police Force' 
                        : 'Ministry of Manpower'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Exam Category</p>
                    <p className="text-slate-900 text-sm">
                      {submission.examType === 'SIX_MONTHLY_MDW' && 'Migrant Domestic Worker'}
                      {submission.examType === 'WORK_PERMIT' && 'Work Permit Holder'}
                      {submission.examType === 'AGED_DRIVERS' && 'Aged Driver Assessment'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Submission Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {history && history.events && history.events.length > 0 ? (
                [...history.events]
                  .sort((a, b) => {
                    // First sort by timestamp
                    const timeCompare = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                    
                    // If timestamps are the same or very close (within 1 second), enforce logical order
                    if (Math.abs(timeCompare) < 1000) {
                      // Define event priority (lower number = earlier in timeline)
                      const eventPriority: Record<string, number> = {
                        'created': 1,
                        'updated': 2,
                        'submitted_for_approval': 3,  // Routed for approval
                        'approved': 4,  // Approved by doctor
                        'submitted_to_agency': 5,  // Submitted to agency (must be after approved)
                        'rejected': 6,
                      };
                      
                      // Determine event types based on eventType and details
                      const getEventPriority = (event: any) => {
                        if (event.eventType === 'updated' && event.details?.action === 'reopened') {
                          return 2; // Same as updated
                        }
                        if (event.eventType === 'submitted' && event.details?.status === 'pending_approval') {
                          return eventPriority['submitted_for_approval'];
                        }
                        if (event.eventType === 'submitted' && event.details?.status === 'submitted') {
                          return eventPriority['submitted_to_agency'];
                        }
                        if (event.eventType === 'approved') {
                          return eventPriority['approved'];
                        }
                        return eventPriority[event.eventType] || 99;
                      };
                      
                      return getEventPriority(a) - getEventPriority(b);
                    }
                    
                    return timeCompare;
                  })
                  .reverse()
                  .map((event: any, index: number) => {
                  const getEventIcon = (eventType: string, details: any) => {
                    // Check if this is a reopen action
                    if (eventType === 'updated' && details?.action === 'reopened') {
                      return { icon: FileText, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
                    }
                    
                    switch (eventType) {
                      case 'created':
                        return { icon: FileText, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
                      case 'updated':
                        return { icon: FileText, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' };
                      case 'submitted':
                        return { icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
                      case 'approved':
                        return { icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
                      case 'rejected':
                        return { icon: XCircle, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
                      default:
                        return { icon: FileText, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
                    }
                  };

                  const getEventLabel = (eventType: string, details: any) => {
                    // Check if this is a reopen action
                    if (eventType === 'updated' && details?.action === 'reopened') {
                      return 'Reopened for Editing';
                    }
                    
                    switch (eventType) {
                      case 'created':
                        return 'Draft Created';
                      case 'updated':
                        return 'Draft Updated';
                      case 'submitted':
                        // Check the status at the TIME of this event (from details), not current submission status
                        if (details?.status === 'submitted') {
                          return 'Submitted to Agency';
                        }
                        // If status was pending_approval, this means routed for approval
                        if (details?.status === 'pending_approval') {
                          return 'Routed for Approval';
                        }
                        // Fallback for old events without status in details
                        return 'Submitted';
                      case 'approved':
                        return 'Approved by Doctor';
                      case 'rejected':
                        return 'Rejected';
                      default:
                        return eventType.charAt(0).toUpperCase() + eventType.slice(1);
                    }
                  };

                  const getEventDescription = (eventType: string, details: any) => {
                    // Check if this is a reopen action
                    if (eventType === 'updated' && details?.action === 'reopened') {
                      return `Changed from ${details.previousStatus} back to ${details.newStatus}`;
                    }
                    
                    if (eventType === 'submitted') {
                      // If routed for approval (status was pending_approval), show assigned doctor
                      if (details?.status === 'pending_approval' && details?.assignedDoctorName) {
                        return `Assigned to: ${details.assignedDoctorName}`;
                      }
                      // If submitted to agency (status was submitted), show agency name
                      if (details?.status === 'submitted' && details?.agency) {
                        return details.agency;
                      }
                      // Fallback to assigned doctor from submission if not in event details
                      if (submission.assignedDoctorName && !details?.agency) {
                        return `Assigned to: ${submission.assignedDoctorName}`;
                      }
                    }
                    if (eventType === 'approved' && submission.approvedByName) {
                      return `By: ${submission.approvedByName}`;
                    }
                    if (eventType === 'rejected' && details?.reason) {
                      return `Reason: ${details.reason}`;
                    }
                    return null;
                  };

                  const { icon: Icon, bgColor, iconColor } = getEventIcon(event.eventType, event.details);

                  return (
                    <div key={index} className="flex gap-3">
                      <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{getEventLabel(event.eventType, event.details)}</p>
                        {getEventDescription(event.eventType, event.details) && (
                          <p className="text-xs text-slate-600">{getEventDescription(event.eventType, event.details)}</p>
                        )}
                        <p className="text-xs text-slate-500">{event.userName}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">Created</p>
                    <p className="text-xs text-slate-500">{submission.createdByName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(submission.createdDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Doctor Action Buttons - only show for doctors viewing pending approvals */}
      {user?.role === 'doctor' && submission.status === 'pending_approval' && (
        <Card>
          <CardHeader>
            <CardTitle>Doctor Actions</CardTitle>
            <CardDescription>
              Review the submission and approve or reject with remarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject with Remarks
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowApproveDialog(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Submission
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nurse Reopen Button - only show for nurses viewing their own rejected submissions */}
      {user?.role === 'nurse' && submission.status === 'rejected' && submission.createdById === user.id && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Rejected</CardTitle>
            <CardDescription>
              This submission was rejected. You can reopen it to make changes and resubmit for approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submission.rejectedReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{submission.rejectedReason}</p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      await submissionsApi.reopenSubmission(id!);
                      toast.success('Submission reopened and moved to drafts');
                      navigate(`/draft/${id}`);
                    } catch (error) {
                      console.error('Failed to reopen submission:', error);
                      toast.error('Failed to reopen submission');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Reopening...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Reopen & Edit Submission
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Medical Submission</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve this medical examination for <strong>{submission?.patientName}</strong>.
              This will submit it to the relevant agency.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2 py-4">
            <Label htmlFor="approval-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="approval-notes"
              placeholder="Add any additional notes or comments..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={4}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Submit
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Medical Submission</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reject this medical examination for <strong>{submission?.patientName}</strong>.
              Please provide a reason for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2 py-4">
            <Label htmlFor="rejection-reason">
              Reason for Rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please explain why this submission is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Submission
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
