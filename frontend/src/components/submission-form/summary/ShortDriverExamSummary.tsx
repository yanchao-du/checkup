import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';
import type { UserClinic } from '../../../types/api';

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
  doctorName?: string;
  doctorMcrNumber?: string;
  clinicInfo?: UserClinic;
  userRole?: 'nurse' | 'doctor' | 'admin';
  onDeclarationChange?: (checked: boolean) => void;
}

const PURPOSE_LABELS: Record<string, string> = {
  AGE_65_ABOVE_TP_ONLY: 'Renew driving licence (for drivers aged 65 and above) for submission to Traffic Police only',
  AGE_65_ABOVE_TP_LTA: 'Renew driving licence and vocational licence (for drivers aged 65 and above) for submission to Traffic Police and Land Transport Authority',
  AGE_64_BELOW_LTA_ONLY: 'Renew vocational licence (for drivers aged 64 and below) for submission to Land Transport Authority only',
  BAVL_ANY_AGE: 'Renew only Bus Attendant\'s Vocational Licence (BAVL) regardless of age',
};

export function ShortDriverExamSummary({
  formData,
  patientInfo,
  purposeOfExam,
  examinationDate,
  onEdit,
  doctorName,
  doctorMcrNumber,
  clinicInfo,
  userRole,
  onDeclarationChange,
}: ShortDriverExamSummaryProps) {
  // Determine which fitness questions are relevant based on purpose
  const showMotorVehicleFitness = purposeOfExam === 'AGE_65_ABOVE_TP_ONLY';
  
  const showPsvFitness = 
    purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
    purposeOfExam === 'AGE_64_BELOW_LTA_ONLY';
  
  const showBavlFitness = 
    purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
    purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' ||
    purposeOfExam === 'BAVL_ANY_AGE';

  return (
    <div className="space-y-4">
      {/* Patient Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Patient Information</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('patient-info')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Patient Name</p>
              <p className="font-medium">{patientInfo.name || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">NRIC/FIN</p>
              <p className="font-medium">{patientInfo.nric || '-'}</p>
            </div>
            {patientInfo.mobile && (
              <div>
                <p className="text-slate-500">Mobile Number</p>
                <p className="font-medium">{patientInfo.mobile}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500">Examination Date</p>
              <p className="font-medium">{examinationDate ? new Date(examinationDate).toLocaleDateString() : '-'}</p>
            </div>
            {purposeOfExam && (
              <div className="col-span-2">
                <p className="text-slate-500">Purpose of Examination</p>
                <p className="font-medium">{PURPOSE_LABELS[purposeOfExam] || purposeOfExam}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overall Assessment */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Overall Assessment</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('overall-assessment')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="space-y-4 text-sm">
            {showMotorVehicleFitness && (
              <div>
                <p className="text-slate-500">Physically and mentally fit to drive a motor vehicle?</p>
                <p className="font-medium">
                  {formData.fitToDriveMotorVehicle === 'yes' ? (
                    <span className="text-green-600">Yes</span>
                  ) : formData.fitToDriveMotorVehicle === 'no' ? (
                    <span className="text-red-600">No</span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            )}
            {showPsvFitness && (
              <div>
                <p className="text-slate-500">Physically and mentally fit to drive a Public Service Vehicle (PSV)?</p>
                <p className="font-medium">
                  {formData.fitToDrivePsv === 'yes' ? (
                    <span className="text-green-600">Yes</span>
                  ) : formData.fitToDrivePsv === 'no' ? (
                    <span className="text-red-600">No</span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            )}
            {showBavlFitness && (
              <div>
                <p className="text-slate-500">Physically and mentally fit to hold a Bus Attendant's Vocational Licence (BAVL)?</p>
                <p className="font-medium">
                  {formData.fitForBavl === 'yes' ? (
                    <span className="text-green-600">Yes</span>
                  ) : formData.fitForBavl === 'no' ? (
                    <span className="text-red-600">No</span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Declaration Section */}
      <Card>
        <CardContent className="pt-6 bg-blue-50">
          {/* Doctor Information Display */}
          {doctorName && (
            <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">{userRole === 'nurse' ? 'Prepared by' : 'Examining Doctor'}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Name:</span>
                  <span className="text-gray-900">{doctorName}</span>
                </div>
                {doctorMcrNumber && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-24">MCR Number:</span>
                    <span className="text-gray-900">{doctorMcrNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clinic Information Display */}
          {clinicInfo && (
            <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Clinic</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Name:</span>
                  <span className="text-gray-900">{clinicInfo.name}</span>
                </div>
                {clinicInfo.hciCode && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-24">HCI Code:</span>
                    <span className="text-gray-900">{clinicInfo.hciCode}</span>
                  </div>
                )}
                {clinicInfo.phone && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-24">Phone:</span>
                    <span className="text-gray-900">{clinicInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Practitioner Declaration */}
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Medical Practitioner Declaration</h4>
          <label className="flex items-start space-x-3 cursor-pointer bg-white p-3 rounded border border-teal-300">
            <input
              type="checkbox"
              checked={formData.declarationAgreed === true}
              onChange={(e) => {
                if (onDeclarationChange) {
                  onDeclarationChange(e.target.checked);
                }
              }}
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="text-sm font-normal leading-relaxed text-gray-700">
                I certify that I have examined and identified the patient named above: <span className="text-red-500">*</span>
              </p>
              <ul className="ml-6 mt-2 space-y-2 text-sm font-normal leading-relaxed text-gray-700 list-disc">
                <li>He/she has presented his/her identity card, which bears the same name and identification number as on this form.</li>
                <li>The answers to the questions above are correct to the best of my knowledge.</li>
              </ul>
            </div>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
