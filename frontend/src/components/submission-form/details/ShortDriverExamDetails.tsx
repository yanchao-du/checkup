import { Separator } from '../../ui/separator';

interface ShortDriverExamDetailsProps {
  submission: any;
}

export function ShortDriverExamDetails({ submission }: ShortDriverExamDetailsProps) {
  const formData = submission.formData;
  const purposeOfExam = submission.purposeOfExam;

  // Determine which fitness questions are relevant
  const showMotorVehicleFitness = purposeOfExam === 'AGE_65_ABOVE_TP_ONLY';
  const showPsvFitness = 
    purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
    purposeOfExam === 'AGE_64_BELOW_LTA_ONLY';
  const showBavlFitness = 
    purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
    purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' ||
    purposeOfExam === 'BAVL_ANY_AGE';

  return (
    <>
      <Separator />
      
      {/* Overall Assessment */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Overall Assessment</h4>
        <div className="space-y-3">
          {showMotorVehicleFitness && (
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-700 flex-1">
                Physically and mentally fit to drive a motor vehicle?
              </p>
              <p className={`text-sm font-semibold ml-4 ${
                formData.fitToDriveMotorVehicle === 'yes' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.fitToDriveMotorVehicle === 'yes' ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          {showPsvFitness && (
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-700 flex-1">
                Physically and mentally fit to drive a Public Service Vehicle (PSV)?
              </p>
              <p className={`text-sm font-semibold ml-4 ${
                formData.fitToDrivePsv === 'yes' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.fitToDrivePsv === 'yes' ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          {showBavlFitness && (
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-700 flex-1">
                Physically and mentally fit to hold a Bus Attendant's Vocational Licence (BAVL)?
              </p>
              <p className={`text-sm font-semibold ml-4 ${
                formData.fitForBavl === 'yes' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.fitForBavl === 'yes' ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Medical Practitioner Declaration */}
      {submission.status === 'submitted' && formData.declarationAgreed && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Medical Practitioner Declaration</h4>
            
            {/* Doctor/Nurse Information */}
            {(submission.approvedByName || submission.createdByName) && (
              <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                <h5 className="font-semibold text-sm text-blue-900 mb-2">
                  {submission.approvedByName ? 'Examining Doctor' : 'Prepared by'}
                </h5>
                <div className="space-y-1 text-sm">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-32">Name:</span>
                    <span className="text-gray-900">{submission.approvedByName || submission.createdByName}</span>
                  </div>
                  {(submission.approvedByMcrNumber || submission.createdByMcrNumber) && (
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 w-32">MCR Number:</span>
                      <span className="text-gray-900">{submission.approvedByMcrNumber || submission.createdByMcrNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Clinic Information */}
            {submission.clinicName && (
              <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                <h5 className="font-semibold text-sm text-blue-900 mb-2">Clinic</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-32">Name:</span>
                    <span className="text-gray-900">{submission.clinicName}</span>
                  </div>
                  {submission.clinicHciCode && (
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 w-32">HCI Code:</span>
                      <span className="text-gray-900">{submission.clinicHciCode}</span>
                    </div>
                  )}
                  {submission.clinicPhone && (
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 w-32">Phone:</span>
                      <span className="text-gray-900">{submission.clinicPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Declaration Text */}
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <p className="text-blue-700 font-medium mb-2">✓ Declaration confirmed</p>
              <p className="text-sm leading-relaxed text-gray-700">
                I certify that I have examined and identified the patient named above:
              </p>
              <ul className="ml-6 mt-2 space-y-2 text-sm leading-relaxed text-gray-700 list-disc">
                <li>He/she has presented his/her identity card, which bears the same name and identification number as on this form.</li>
                <li>The answers to the questions above are correct to the best of my knowledge.</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
