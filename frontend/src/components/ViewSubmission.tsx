import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { approvalsApi } from '../services/approvals.service';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { getSubmissionStatusBadgeVariant, getSubmissionStatusLabel } from '../lib/badge-utils';
import { SixMonthlyMdwDetails } from './submission-view/SixMonthlyMdwDetails';
import { SixMonthlyFmwDetails } from './submission-view/SixMonthlyFmwDetails';
import { WorkPermitDetails } from './submission-view/WorkPermitDetails';
import { AgedDriversDetails } from './submission-view/AgedDriversDetails';
import { IcaExamDetails } from './submission-view/IcaExamDetails';
import { SubmissionTimeline } from './submission-view/SubmissionTimeline';
import { formatExamTypeFull } from '../lib/formatters';
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
  const location = useLocation();
  // Originating route (if provided) so we can navigate back directly without relying on history stack
  const origin = (location.state as any)?.from as string | undefined;
  const { user } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
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
        setSubmission({ ...submissionData, history: historyData });
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
        <Button variant="ghost" size="icon" onClick={() => origin ? navigate(origin) : navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-slate-900 mb-1 text-2xl font-semibold">Medical Exam Details</h2>
          <p className="text-slate-600">View submission information</p>
        </div>
        <Badge
          variant={getSubmissionStatusBadgeVariant(submission.status)}
          className="text-sm px-3 py-1"
        >
          {getSubmissionStatusLabel(submission.status)}
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
                {submission.examType === 'AGED_DRIVERS' && submission.patientDateOfBirth && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                    <p className="text-slate-900">
                      {new Date(submission.patientDateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
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
                  {submission.examType === 'SIX_MONTHLY_MDW' && 'Six-monthly Medical Exam for Migrant Domestic Worker'}
                  {submission.examType === 'SIX_MONTHLY_FMW' && 'Six-monthly Medical Exam for Female Migrant Worker'}
                  {submission.examType === 'WORK_PERMIT' && 'Full Medical Exam for Work Permit'}
                  {submission.examType === 'AGED_DRIVERS' && 'Medical Exam for Aged Drivers'}
                  {submission.examType === 'PR_MEDICAL' && 'Medical Examination for Permanent Residency'}
                  {submission.examType === 'STUDENT_PASS_MEDICAL' && 'Medical Examination for Student Pass'}
                  {submission.examType === 'LTVP_MEDICAL' && 'Medical Examination for Long Term Visit Pass'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Examination Results</CardTitle>
              {/* <CardDescription>{submission.examType}</CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Body Measurements Section */}
              {(submission.formData.height || submission.formData.weight || submission.formData.bloodPressure) && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Body Measurements</h4>
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
                      {(() => {
                        // Calculate BMI if height and weight are available
                        if (submission.formData.height && submission.formData.weight) {
                          const heightInMeters = parseFloat(submission.formData.height) / 100;
                          const weightInKg = parseFloat(submission.formData.weight);
                          if (!isNaN(heightInMeters) && !isNaN(weightInKg) && heightInMeters > 0) {
                            const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
                            const getBMICategory = (bmiValue: number) => {
                              if (bmiValue < 18.5) return 'Underweight';
                              if (bmiValue < 23) return 'Normal';
                              if (bmiValue < 27.5) return 'Overweight';
                              return 'Obese';
                            };
                            return (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">BMI</p>
                                {(() => {
                                  const category = getBMICategory(parseFloat(bmi));
                                  const isAlert = category === 'Underweight' || category === 'Obese';
                                  return (
                                    <p className="text-slate-900">
                                      {bmi} - 
                                      <span className={isAlert ? 'font-semibold text-red-600' : ''}> {category}</span>
                                    </p>
                                  );
                                })()}
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}
                      {submission.formData.bloodPressure && (
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Blood Pressure</p>
                          <p className="text-slate-900">{submission.formData.bloodPressure}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}


              {/* Exam type specific fields */}
              {submission.examType === 'SIX_MONTHLY_MDW' && (
                <SixMonthlyMdwDetails formData={submission.formData} />
              )}

              {submission.examType === 'SIX_MONTHLY_FMW' && (
                <SixMonthlyFmwDetails formData={submission.formData} />
              )}

              {submission.examType === 'WORK_PERMIT' && (
                <WorkPermitDetails formData={submission.formData} />
              )}

              {submission.examType === 'AGED_DRIVERS' && (
                <AgedDriversDetails formData={submission.formData} />
              )}

              {(submission.examType === 'PR_MEDICAL' || 
                submission.examType === 'STUDENT_PASS_MEDICAL' || 
                submission.examType === 'LTVP_MEDICAL') && (
                <IcaExamDetails formData={submission.formData} />
              )}

              {/* General Remarks section - only for exam types that don't include remarks in their detail components */}
              {(submission.examType === 'WORK_PERMIT' || submission.examType === 'AGED_DRIVERS') && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Remarks</h4>
                    <div className="bg-slate-50 p-3 rounded-md">
                      <p className="text-sm text-slate-900 whitespace-pre-wrap">{submission.formData.remarks ? submission.formData.remarks : '-'}</p>
                    </div>
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
                      {submission.examType === 'AGED_DRIVERS' && 'Singapore Police Force'}
                      {(submission.examType === 'SIX_MONTHLY_MDW' || 
                        submission.examType === 'SIX_MONTHLY_FMW' || 
                        submission.examType === 'WORK_PERMIT') && 'Ministry of Manpower'}
                      {(submission.examType === 'PR_MEDICAL' || 
                        submission.examType === 'STUDENT_PASS_MEDICAL' || 
                        submission.examType === 'LTVP_MEDICAL') && 'Immigration & Checkpoints Authority'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Exam Category</p>
                    <p className="text-slate-900 text-sm">
                      {formatExamTypeFull(submission.examType)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Timeline */}
          <SubmissionTimeline history={submission.history} submission={submission} />
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
                Approve and Submit
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
