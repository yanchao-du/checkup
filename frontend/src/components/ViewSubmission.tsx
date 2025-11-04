import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { approvalsApi } from '../services/approvals.service';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { getDisplayName } from '../lib/nameDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, CheckCircle, Edit, Loader2, XCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { getSubmissionStatusBadgeVariant, getSubmissionStatusLabel } from '../lib/badge-utils';
import { calculateAge, formatAge } from '../lib/ageCalculation';
import { SixMonthlyMdwDetails } from './submission-view/SixMonthlyMdwDetails';
import { SixMonthlyFmwDetails } from './submission-view/SixMonthlyFmwDetails';
import { WorkPermitDetails } from './submission-view/WorkPermitDetails';
import { AgedDriversDetails } from './submission-view/AgedDriversDetails';
import { IcaExamDetails } from './submission-view/IcaExamDetails';
import { DrivingLicenceTpDetails } from './submission-form/details/DrivingLicenceTpDetails';
import { DrivingVocationalTpLtaDetails } from './submission-form/details/DrivingVocationalTpLtaDetails';
import { VocationalLicenceLtaDetails } from './submission-form/details/VocationalLicenceLtaDetails';
import { SubmissionTimeline } from './submission-view/SubmissionTimeline';
import { DeclarationView } from './submission-view/DeclarationView';
import { MomDeclarationContent, IcaDeclarationContent } from './submission-form/summary/DeclarationContent';
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

const isDriverExamType = (examType: string) => {
  return examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA' || examType === 'VOCATIONAL_LICENCE_LTA';
};

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

      {/* Submission Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        <p className="text-sm text-slate-600">
          <span className="font-medium">Submission Reference:</span>{' '}
          <span className="font-mono">{submission.id}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Name</p>
                  <p className="text-slate-900">{getDisplayName(submission.patientName, submission.examType, submission.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">NRIC/FIN</p>
                  <p className="text-slate-900">{submission.patientNric}</p>
                </div>
                {submission.patientDateOfBirth && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                    <p className="text-slate-900">{new Date(submission.patientDateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                {/* Clinic Information */}
                {submission.clinicName && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 mb-1">Clinic</p>
                    <p className="text-slate-900 font-medium">{submission.clinicName}</p>
                    {(submission.clinicHciCode || submission.clinicPhone) && (
                      <p className="text-sm text-slate-600">
                        {[submission.clinicHciCode, submission.clinicPhone].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                )}
                {isDriverExamType(submission.examType) && submission.patientEmail && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email Address</p>
                    <p className="text-slate-900">{submission.patientEmail}</p>
                  </div>
                )}
                {isDriverExamType(submission.examType) && submission.patientMobile && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Mobile Number</p>
                    <p className="text-slate-900">+65 {submission.patientMobile}</p>
                  </div>
                )}
                {(submission.examType === 'DRIVING_LICENCE_TP' || submission.examType === 'DRIVING_VOCATIONAL_TP_LTA') && (submission as any).drivingLicenseClass && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Class of Driving Licence</p>
                    <p className="text-slate-900">{(submission as any).drivingLicenseClass}</p>
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
                {isDriverExamType(submission.examType) && submission.patientDateOfBirth && submission.examinationDate && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Age at Examination</p>
                    <p className="text-slate-900">
                      {formatAge(calculateAge(submission.patientDateOfBirth, submission.examinationDate))}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Medical Examination Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Body Measurements Section - exclude driver exams as they have their own details component */}
              {!isDriverExamType(submission.examType) && (submission.formData.height || submission.formData.weight || submission.formData.bloodPressure) && (
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
                <SixMonthlyMdwDetails submission={submission} />
              )}

              {submission.examType === 'SIX_MONTHLY_FMW' && (
                <SixMonthlyFmwDetails submission={submission} />
              )}

              {submission.examType === 'WORK_PERMIT' && (
                <WorkPermitDetails submission={submission} />
              )}

              {submission.examType === 'AGED_DRIVERS' && (
                <AgedDriversDetails submission={submission} />
              )}

              {submission.examType === 'DRIVING_LICENCE_TP' && (
                <DrivingLicenceTpDetails submission={submission} />
              )}

              {submission.examType === 'DRIVING_VOCATIONAL_TP_LTA' && (
                <DrivingVocationalTpLtaDetails submission={submission} />
              )}

              {submission.examType === 'VOCATIONAL_LICENCE_LTA' && (
                <VocationalLicenceLtaDetails submission={submission} />
              )}

              {(submission.examType === 'PR_MEDICAL' || 
                submission.examType === 'STUDENT_PASS_MEDICAL' || 
                submission.examType === 'LTVP_MEDICAL') && (
                <IcaExamDetails submission={submission} />
              )}

              {/* General Remarks section - for all exam types except ICA and driver exams (which include remarks in their detail components) */}
              {submission.examType !== 'PR_MEDICAL' && 
               submission.examType !== 'STUDENT_PASS_MEDICAL' && 
               submission.examType !== 'LTVP_MEDICAL' &&
               submission.examType !== 'DRIVING_LICENCE_TP' &&
               submission.examType !== 'DRIVING_VOCATIONAL_TP_LTA' &&
               submission.examType !== 'VOCATIONAL_LICENCE_LTA' && (
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

              {/* Declaration - show for submitted submissions (MOM exams only) */}
              {submission.status === 'submitted' && (
                <>
                  <Separator />
                  {(submission.examType === 'PR_MEDICAL' || 
                    submission.examType === 'STUDENT_PASS_MEDICAL' || 
                    submission.examType === 'LTVP_MEDICAL') && (
                    <DeclarationView
                      doctorName={submission.approvedByName || submission.createdByName}
                      doctorMcrNumber={submission.approvedByMcrNumber || submission.createdByMcrNumber}
                    >
                      <IcaDeclarationContent />
                    </DeclarationView>
                  )}
                  {submission.examType !== 'PR_MEDICAL' && 
                   submission.examType !== 'STUDENT_PASS_MEDICAL' && 
                   submission.examType !== 'LTVP_MEDICAL' &&
                   !isDriverExamType(submission.examType) && (
                    <DeclarationView
                      doctorName={submission.approvedByName || submission.createdByName}
                      doctorMcrNumber={submission.approvedByMcrNumber || submission.createdByMcrNumber}
                    >
                      <MomDeclarationContent />
                    </DeclarationView>
                  )}
                </>
              )}

              {/* Reopen button for nurses viewing rejected submissions */}
              {user?.role === 'nurse' && submission.status === 'rejected' && submission.createdById === user.id && (
                <>
                  <Separator />
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
                </>
              )}
              
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Exam Category - show for draft, pending_approval, rejected, and submitted */}
          {(submission.status === 'draft' || 
            submission.status === 'pending_approval' || 
            submission.status === 'rejected' || 
            submission.status === 'submitted') && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {submission.status === 'submitted' ? 'Agency and Exam Information' : 'Exam Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submission.status === 'submitted' && (
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
                        {submission.examType === 'DRIVING_LICENCE_TP' && 'Traffic Police'}
                        {submission.examType === 'DRIVING_VOCATIONAL_TP_LTA' && 'Traffic Police & Land Transport Authority'}
                        {submission.examType === 'VOCATIONAL_LICENCE_LTA' && 'Land Transport Authority'}
                      </p>
                    </div>
                  )}
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
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => navigate(`/draft/${submission.id}`)}
                className="w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Submission
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject with Remarks
              </Button>
              <Button
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                onClick={() => setShowApproveDialog(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve and Submit
              </Button>
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
              You are about to approve this medical examination for <strong>{getDisplayName(submission?.patientName || '', submission?.examType || '', submission?.status)}</strong>.
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
              You are about to reject this medical examination for <strong>{getDisplayName(submission?.patientName || '', submission?.examType || '', submission?.status)}</strong>.
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
