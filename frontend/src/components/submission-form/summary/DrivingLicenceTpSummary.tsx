import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';

interface DrivingLicenceTpSummaryProps {
  formData: Record<string, any>;
  patientInfo: {
    name: string;
    nric: string;
    dateOfBirth?: string;
    drivingLicenseClass?: string;
    email?: string;
    mobile?: string;
  };
  examinationDate: string;
  onEdit?: (section: string) => void;
  onChange?: (key: string, value: any) => void;
}

export function DrivingLicenceTpSummary({
  formData,
  patientInfo,
  examinationDate,
  onEdit,
  onChange,
}: DrivingLicenceTpSummaryProps) {
  const medicalDeclaration = formData.medicalDeclaration || {};
  const medicalHistory = formData.medicalHistory || {};
  const amt = formData.amt || {};
  const assessment = formData.assessment || {};
  const abnormalityChecklist = formData.abnormalityChecklist || {};

  // Helper to get checked declaration items
  const getCheckedDeclarations = () => {
    const items: string[] = [];
    const labels: Record<string, string> = {
      consultingPractitioner: 'Currently consulting a medical practitioner for a pre-existing or newly diagnosed medical condition',
      takingMedication: 'Currently taking medication for a pre-existing or newly diagnosed medical condition',
      hospitalAdmission: 'Recently warded in or discharged from hospital',
      rehabilitativeTreatment: 'Currently receiving or recently received rehabilitative treatment (for stroke patients)',
      driverRehabilitation: 'Has attended a driver rehabilitation and medical fitness assessment programme',
      otherMedicalProblems: 'Has any other relevant medical problems or injuries not mentioned above',
    };

    Object.entries(labels).forEach(([key, label]) => {
      if (medicalDeclaration[key]) {
        items.push(label);
      }
    });

    return items;
  };

  // Helper to get checked history items
  const getCheckedHistory = () => {
    const items = [];
    const labels: Record<string, string> = {
      cardiovascular: 'Cardiovascular disease',
      neurological: 'Neurological disorder',
      psychiatric: 'Psychiatric condition',
      diabetes: 'Diabetes mellitus',
      vision: 'Vision problems',
      hearing: 'Hearing problems',
      musculoskeletal: 'Musculoskeletal disorder',
    };

    Object.entries(labels).forEach(([key, label]) => {
      if (medicalHistory[key]) {
        items.push(label);
      }
    });

    if (medicalHistory.other) {
      items.push(`Other: ${medicalHistory.other}`);
    }

    return items;
  };

  // Helper to get abnormalities
  const getAbnormalities = () => {
    const items: string[] = [];
    const labels: Record<string, string> = {
      abdomen: 'Abdomen abnormality',
      abnormalityJointMovement: 'Abnormality or limitation in range of movement of the joints',
      defectInHearing: 'Defect in hearing',
      deformitiesPhysicalDisabilities: 'Deformities and/or physical disabilities observed',
      colourPerception: 'Difficulty in accurately recognising the colours red, green and amber',
      fingerNoseCoordination: 'Finger-nose coordination abnormality',
      limitationLimbStrength: 'Limitation in strength of upper limbs and lower limbs',
      lungs: 'Lungs abnormality',
      nervousSystem: 'Nervous system abnormality',
      neuroMuscularSystem: 'Neuro-muscular system abnormality',
      alcoholDrugAddiction: 'Evidence of being addicted to the excessive use of alcohol or drug',
      psychiatricDisorder: 'Psychiatric disorder',
      cognitiveImpairment: 'Sign of cognitive impairment',
    };

    Object.entries(labels).forEach(([key, label]) => {
      if (abnormalityChecklist[key]?.checked) {
        const remarks = abnormalityChecklist[key]?.remarks;
        items.push(remarks ? `${label}: ${remarks}` : label);
      }
    });

    return items;
  };

  const checkedDeclarations = getCheckedDeclarations();
  const checkedHistoryItems = getCheckedHistory();
  const abnormalities = getAbnormalities();

  // Calculate age at examination
  const calculateAge = (dateOfBirth: string, examDate: string) => {
    const birth = new Date(dateOfBirth);
    const exam = new Date(examDate);
    let age = exam.getFullYear() - birth.getFullYear();
    const monthDiff = exam.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && exam.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const ageAtExamination = patientInfo.dateOfBirth 
    ? calculateAge(patientInfo.dateOfBirth, examinationDate) 
    : null;

  return (
    <div className="space-y-6">
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
              <p className="font-medium">{patientInfo.name}</p>
            </div>
            <div>
              <p className="text-slate-500">NRIC/FIN</p>
              <p className="font-medium">{patientInfo.nric}</p>
            </div>
            {patientInfo.dateOfBirth && (
              <div>
                <p className="text-slate-500">Date of Birth</p>
                <p className="font-medium">{new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
              </div>
            )}
            {ageAtExamination !== null && (
              <div>
                <p className="text-slate-500">Age at Examination</p>
                <p className="font-medium">{ageAtExamination} years</p>
              </div>
            )}
            {patientInfo.drivingLicenseClass && (
              <div>
                <p className="text-slate-500">Class of Driving Licence</p>
                <p className="font-medium">{patientInfo.drivingLicenseClass}</p>
              </div>
            )}
            {patientInfo.email && (
              <div>
                <p className="text-slate-500">Email Address</p>
                <p className="font-medium">{patientInfo.email}</p>
              </div>
            )}
            {patientInfo.mobile && (
              <div>
                <p className="text-slate-500">Mobile Number</p>
                <p className="font-medium">{patientInfo.mobile}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500">Examination Date</p>
              <p className="font-medium">{new Date(examinationDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Declaration by Patient */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Medical Declaration by Patient</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('medical-declaration')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3 italic">Conditions experienced in the past 6 months:</p>
          {checkedDeclarations.length > 0 ? (
            <>
              <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                {checkedDeclarations.map((item, index) => (
                  <li key={index} className="text-amber-700">✓ {item}</li>
                ))}
              </ul>
              
              {/* Remarks */}
              {medicalDeclaration.remarks && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Remarks</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                    {medicalDeclaration.remarks}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-600 italic">No conditions declared</p>
          )}
          
          {/* Patient Certification */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Declaration by Patient to Medical Practitioner</h4>
            <div className={`text-sm p-3 rounded-md ${medicalDeclaration.patientCertification ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              {medicalDeclaration.patientCertification ? (
                <p className="text-green-700 font-medium">✓ Patient certification confirmed</p>
              ) : (
                <p className="text-gray-600 italic">Patient certification not completed</p>
              )}
              <p className="text-xs text-gray-600 mt-2">The patient certifies that:</p>
              <ul className="text-xs text-gray-600 mt-1 ml-4 space-y-1 list-disc">
                <li>The declaration has been explained to them</li>
                <li>Their responses are complete and correct</li>
                <li>No relevant information has been withheld</li>
                <li>They consent to physician communication</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History of Patient */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Medical History of Patient</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('medical-history')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          {checkedHistoryItems.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {checkedHistoryItems.map((item, index) => (
                <li key={index} className="text-amber-700">✓ {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600 italic">No pre-existing conditions</p>
          )}
        </CardContent>
      </Card>

      {/* General Medical Examination */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">General Medical Examination</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('general-medical')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {/* Cardiovascular Assessment */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Cardiovascular Assessment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Blood Pressure:</span>
                  <p className="font-medium">{formData.bloodPressure || '-'} mmHg</p>
                </div>
                <div>
                  <span className="text-gray-600">Pulse:</span>
                  <p className="font-medium">{formData.pulse || '-'} bpm</p>
                </div>
                <div>
                  <span className="text-gray-600">S1_S2 Reading:</span>
                  <p className="font-medium">{formData.s1S2Reading || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Murmurs:</span>
                  <p className="font-medium">{formData.murmurs || '-'}</p>
                </div>
              </div>
            </div>

            {/* Vision Assessment */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Vision Assessment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Optical Aids:</span>
                  <p className="font-medium">{formData.opticalAids === 'yes' ? 'Yes' : formData.opticalAids === 'no' ? 'No' : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Visual Acuity:</span>
                  <p className="font-medium">{formData.visualAcuity || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Near Vision (RE):</span>
                  <p className="font-medium">{formData.nearVisionRE || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Near Vision (LE):</span>
                  <p className="font-medium">{formData.nearVisionLE || '-'}</p>
                </div>
              </div>
            </div>

            {/* General Condition */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">General Condition</h4>
              <div className="text-sm">
                <span className="text-gray-600">Pass General Condition:</span>
                <p className={`font-medium inline ml-2 ${formData.passGeneralCondition === 'yes' ? 'text-green-600' : formData.passGeneralCondition === 'no' ? 'text-red-600' : ''}`}>
                  {formData.passGeneralCondition === 'yes' ? '✓ Yes' : formData.passGeneralCondition === 'no' ? '✗ No' : '-'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Abnormality Checklist */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Physical & Mental Abnormalities Observed</h4>
            {abnormalities.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {abnormalities.map((item, index) => (
                  <li key={index} className="text-red-700">⚠ {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 italic">No abnormalities observed</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Abbreviated Mental Test (AMT) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Abbreviated Mental Test (AMT)</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('amt')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-3xl font-bold text-blue-700">{amt.score || 0}/10</p>
            </div>
            {amt.score < 8 && (
              <div className="bg-amber-100 border border-amber-300 rounded-md px-4 py-2">
                <p className="text-sm font-medium text-amber-800">
                  ⚠️ Low AMT score may indicate cognitive impairment
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overall Result of Medical Examination */}
      <Card>
        <CardContent className="pt-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Result of Medical Examination</h3>
        
        {/* Fit to Drive Question */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Is the patient physically and mentally fit to drive a motor vehicle? <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitToDrive"
                value="true"
                checked={assessment.fitToDrive === true}
                onChange={() => {
                  if (onChange) {
                    onChange('assessment', { ...assessment, fitToDrive: true });
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitToDrive"
                value="false"
                checked={assessment.fitToDrive === false}
                onChange={() => {
                  if (onChange) {
                    onChange('assessment', { ...assessment, fitToDrive: false });
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">No</span>
            </label>
          </div>
          {assessment.fitToDrive !== undefined && (
            <div className="mt-3">
              <p className={`font-bold text-lg ${assessment.fitToDrive ? 'text-green-600' : 'text-red-600'}`}>
                {assessment.fitToDrive ? '✓ YES - Patient is fit to drive' : '✗ NO - Patient is not fit to drive'}
              </p>
            </div>
          )}
        </div>

        {/* Medical Practitioner Declaration */}
        <div className="pt-4 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Medical Practitioner Declaration</h4>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            I certify that I have today examined and identified the patient named above:
          </p>
          <ul className="ml-6 mb-4 space-y-2 text-sm text-gray-700 list-disc">
            <li>He/she has presented his/her identity card, which bears the same name and identification number as on this form.</li>
            <li>The answers to the questions above are correct to the best of my knowledge.</li>
          </ul>
          <label className="flex items-start space-x-3 cursor-pointer bg-white p-3 rounded border border-blue-300">
            <input
              type="checkbox"
              checked={assessment.declarationAgreed === true}
              onChange={(e) => {
                if (onChange) {
                  onChange('assessment', { ...assessment, declarationAgreed: e.target.checked });
                }
              }}
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900">
              I agree to the above declaration <span className="text-red-500">*</span>
            </span>
          </label>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
