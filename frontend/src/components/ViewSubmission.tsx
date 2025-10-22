import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from './useMockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, FileText, User, Calendar, CheckCircle } from 'lucide-react';
import { Separator } from './ui/separator';

export function ViewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSubmissionById } = useMockData();

  const submission = id ? getSubmissionById(id) : null;

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
                  <p className="text-sm text-slate-500 mb-1">Exam Type</p>
                  <p className="text-slate-900 text-sm">
                    {submission.examType.includes('Migrant') && 'Six-monthly Medical Exam for Migrant Domestic Workers'}
                    {submission.examType.includes('Work Permit') && 'Full Medical Exam for Work Permit'}
                    {submission.examType.includes('Aged Drivers') && 'Medical Exam for Aged Drivers'}
                  </p>
                </div>
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
              {submission.examType.includes('Migrant') && (
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

              {submission.examType.includes('Work Permit') && (
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

              {submission.examType.includes('Aged Drivers') && (
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

              {submission.approvedDate && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">Approved</p>
                    <p className="text-xs text-slate-500">{submission.approvedByName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(submission.approvedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {submission.submittedDate && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">Submitted</p>
                    <p className="text-xs text-slate-500">
                      {submission.examType.includes('SPF') ? 'Singapore Police Force' : 'Ministry of Manpower'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(submission.submittedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agency Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Submitted To</p>
                  <p className="text-slate-900">
                    {submission.examType.includes('SPF') 
                      ? 'Singapore Police Force' 
                      : 'Ministry of Manpower'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Exam Category</p>
                  <p className="text-slate-900 text-sm">
                    {submission.examType.includes('Migrant') && 'Migrant Domestic Worker'}
                    {submission.examType.includes('Work Permit') && 'Work Permit Holder'}
                    {submission.examType.includes('Aged Drivers') && 'Aged Driver Assessment'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
