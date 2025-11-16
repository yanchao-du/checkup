import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';

interface ShortDriverExamSummaryProps {
  formData: Record<string, any>;
  patientInfo: {
    name: string;
    nric: string;
    mobile?: string;
  };
  purposeOfExam?: string;
  examinationDate: string;
  onEdit?: (section: string) => void;
}

const PURPOSE_LABELS: Record<string, string> = {
  AGE_65_ABOVE_TP_ONLY: 'Age 65+ TP Only',
  AGE_65_ABOVE_TP_LTA: 'Age 65+ TP & LTA',
  AGE_64_BELOW_LTA_ONLY: 'Age 64 & Below LTA Only',
  BAVL_ANY_AGE: 'BAVL (Any Age)',
};

export function ShortDriverExamSummary({
  formData,
  patientInfo,
  purposeOfExam,
  examinationDate,
  onEdit,
}: ShortDriverExamSummaryProps) {
  // Determine which fitness questions are relevant based on purpose
  const showMotorVehicleFitness = 
    purposeOfExam === 'AGE_65_ABOVE_TP_ONLY' || 
    purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
    purposeOfExam === 'AGE_64_BELOW_LTA_ONLY';
  
  const showPsvBavlFitness = 
    purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
    purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' ||
    purposeOfExam === 'BAVL_ANY_AGE';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Review Your Submission</h3>
      <p className="text-sm text-gray-600">
        Please review all information below before submitting. Click Edit to make changes.
      </p>

      {/* Patient Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-base font-semibold">Patient Information</h4>
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit('patient-info')}
                className="h-8 px-2"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Name</dt>
              <dd className="mt-1">{patientInfo.name || '-'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">NRIC</dt>
              <dd className="mt-1">{patientInfo.nric || '-'}</dd>
            </div>
            {patientInfo.mobile && (
              <div>
                <dt className="font-medium text-gray-500">Mobile Number</dt>
                <dd className="mt-1">{patientInfo.mobile}</dd>
              </div>
            )}
            {purposeOfExam && (
              <div>
                <dt className="font-medium text-gray-500">Purpose of Examination</dt>
                <dd className="mt-1">{PURPOSE_LABELS[purposeOfExam] || purposeOfExam}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-gray-500">Examination Date</dt>
              <dd className="mt-1">{examinationDate || '-'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Overall Assessment */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-base font-semibold">Overall Assessment</h4>
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit('overall-assessment')}
                className="h-8 px-2"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            {showMotorVehicleFitness && (
              <div>
                <dt className="font-medium text-gray-500">
                  Physically and mentally fit to drive a motor vehicle?
                </dt>
                <dd className="mt-1 capitalize">
                  {formData.fitToDriveMotorVehicle === 'yes' ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : formData.fitToDriveMotorVehicle === 'no' ? (
                    <span className="text-red-600 font-medium">No</span>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
            )}
            {showPsvBavlFitness && (
              <div>
                <dt className="font-medium text-gray-500">
                  Physically and mentally fit to drive a PSV and/or hold a BAVL?
                </dt>
                <dd className="mt-1 capitalize">
                  {formData.fitToDrivePsvBavl === 'yes' ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : formData.fitToDrivePsvBavl === 'no' ? (
                    <span className="text-red-600 font-medium">No</span>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-gray-500">Declaration</dt>
              <dd className="mt-1">
                {formData.declarationAgreed ? (
                  <span className="text-green-600 font-medium">✓ Agreed</span>
                ) : (
                  <span className="text-gray-400">Not agreed</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
