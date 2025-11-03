import { MedicalSubmission } from '@/types/api';

interface AgedDriversDetailsProps {
  submission: MedicalSubmission;
}

export function AgedDriversDetails({ submission }: AgedDriversDetailsProps) {
  const formData = submission.formData as Record<string, any>;
  
  return (
    <>
      {/* Submission Reference */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 className="font-semibold text-lg mb-3">Submission Reference</h3>
        <div className="text-sm">
          <span className="text-gray-600">Reference Number:</span>
          <p className="font-mono font-medium text-lg">{submission.id}</p>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium">{submission.patientName}</p>
          </div>
          <div>
            <span className="text-gray-600">NRIC/FIN:</span>
            <p className="font-medium">{submission.patientNric}</p>
          </div>
          {submission.patientDateOfBirth && (
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <p className="font-medium">{new Date(submission.patientDateOfBirth).toLocaleDateString()}</p>
            </div>
          )}
          {submission.examinationDate && (
            <div>
              <span className="text-gray-600">Examination Date:</span>
              <p className="font-medium">{new Date(submission.examinationDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      <div>
      <h4 className="text-sm font-semibold text-slate-900 mb-3">Medical Assessment</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500 mb-1">Visual Acuity</p>
          <p className="text-slate-900">{formData.visualAcuity || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1">Hearing Test</p>
          <p className="text-slate-900">{formData.hearingTest || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1">Diabetes</p>
          <p className="text-slate-900">{formData.diabetes || 'Not specified'}</p>
        </div>
      </div>
    </div>
    </>
  );
}
