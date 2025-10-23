import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';

export function ViewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          <Card>
            <CardHeader>
              <CardTitle>Submission Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {history && history.events && history.events.length > 0 ? (
                [...history.events].reverse().map((event: any, index: number) => {
                  const getEventIcon = (eventType: string) => {
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
                        return { icon: FileText, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
                      default:
                        return { icon: FileText, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
                    }
                  };

                  const getEventLabel = (eventType: string, details: any) => {
                    switch (eventType) {
                      case 'created':
                        return 'Draft Created';
                      case 'updated':
                        return 'Draft Updated';
                      case 'submitted':
                        // Only show "Submitted to Agency" if status is actually submitted (not pending_approval)
                        if (details?.status === 'submitted' || submission.status === 'submitted') {
                          return 'Submitted to Agency';
                        }
                        // If status is pending_approval, this means routed for approval
                        return 'Routed for Approval';
                      case 'approved':
                        return 'Approved by Doctor';
                      case 'rejected':
                        return 'Rejected';
                      default:
                        return eventType.charAt(0).toUpperCase() + eventType.slice(1);
                    }
                  };

                  const getEventDescription = (eventType: string, details: any) => {
                    if (eventType === 'submitted') {
                      // If routed for approval, show assigned doctor
                      if (details?.assignedDoctorName || submission.assignedDoctorName) {
                        return `Assigned to: ${details?.assignedDoctorName || submission.assignedDoctorName}`;
                      }
                      // If actually submitted to agency, show agency name
                      if (details?.status === 'submitted' || submission.status === 'submitted') {
                        return submission.examType === 'AGED_DRIVERS' 
                          ? 'Singapore Police Force' 
                          : 'Ministry of Manpower';
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

                  const { icon: Icon, bgColor, iconColor } = getEventIcon(event.eventType);

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
        </div>
      </div>
    </div>
  );
}
