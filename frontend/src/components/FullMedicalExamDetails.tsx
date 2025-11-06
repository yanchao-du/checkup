import { Badge } from '@/components/ui/badge';

interface FullMedicalExamDetailsProps {
  submission: any;
}

export function FullMedicalExamDetails({
  submission,
}: FullMedicalExamDetailsProps) {
  const isFemale = submission.patient?.gender === 'F';
  const formData = submission.formData || {};

  const medicalHistoryConditions = [
    { key: 'cardiovascular', label: 'Cardiovascular disease (e.g. ischemic heart disease)' },
    { key: 'gastrointestinal', label: 'Gastrointestinal disease (e.g. peptic ulcer disease)' },
    { key: 'lifestyleRiskFactors', label: 'Other lifestyle risk factors or significant family history' },
    { key: 'longTermMedications', label: 'Long-term medications' },
    { key: 'mentalHealth', label: 'Mental health condition (e.g. depression)' },
    { key: 'metabolic', label: 'Metabolic disease (diabetes, hypertension)' },
    { key: 'neurological', label: 'Neurological disease (e.g. epilepsy, stroke)' },
    { key: 'previousInfections', label: 'Previous infections of concern (e.g. COVID-19)' },
    { key: 'previousSurgeries', label: 'Previous surgeries' },
    { key: 'respiratory', label: 'Respiratory disease (e.g. tuberculosis, asthma)' },
    { key: 'smokingHistory', label: 'Smoking History (tobacco)' },
    { key: 'otherMedical', label: 'Other medical condition' },
  ];

  const medicalTests = [
    { key: 'hiv', label: 'HIV', checkboxLabel: 'Positive', normalLabel: 'Negative' },
    { key: 'pregnancy', label: 'Pregnancy', femaleOnly: true, checkboxLabel: 'Positive', normalLabel: 'Negative' },
    { key: 'urineAlbumin', label: 'Urine Albumin', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
    { key: 'urineSugar', label: 'Urine Sugar', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
    { key: 'bloodPressure', label: 'Blood Pressure', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
    { key: 'malaria', label: 'Malaria', checkboxLabel: 'Positive', normalLabel: 'Negative' },
    { key: 'colourVision', label: 'Colour Vision', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
  ];

  // Get checked history items
  const getCheckedHistory = () => {
    const items: Array<{ label: string }> = [];
    
    medicalHistoryConditions.forEach((condition) => {
      if (formData[`medicalHistory_${condition.key}`] === 'yes') {
        items.push({ label: condition.label });
      }
    });

    return items;
  };

  const checkedHistoryItems = getCheckedHistory();

  // Get all relevant tests (including female-specific)
  const relevantTests = medicalTests.filter((test) => {
    if (test.femaleOnly && !isFemale) return false;
    return true;
  });

  const getChestXrayLabel = (value: string) => {
    const labels: Record<string, string> = {
      'normal': 'Normal',
      'no-referral': 'No referral needed',
      'cleared-ntbcc': 'Cleared by NTBCC',
      'pregnancy-exempted': 'Pregnancy Exempted',
    };
    return labels[value] || value;
  };

  const getSyphilisLabel = (value: string) => {
    const labels: Record<string, string> = {
      'normal': 'Normal',
      'positive-infectious': 'Positive - Currently Infectious',
      'positive-treated': 'Positive - Treated Inactive',
    };
    return labels[value] || value;
  };

  return (
    <div className="space-y-6">
      {/* Medical History of Patient */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-3 text-gray-900 bg-gray-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-gray-200">Medical History of Patient</h3>
        {checkedHistoryItems.length > 0 ? (
          <ul className="list-disc ml-6 space-y-3 text-sm mb-4">
            {checkedHistoryItems.map((item, index) => (
              <li key={index} className="text-amber-700">
                <div className="font-medium">{item.label}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 italic">No medical history conditions reported</p>
        )}

        {/* Patient Certification */}
        {formData.medicalHistory_patientCertification && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Declaration by Patient to Medical Practitioner</h4>
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-blue-700 font-medium mb-2">✓ Patient certification confirmed</p>
              <p className="text-sm leading-relaxed mb-2">I hereby certify that:</p>
              <ul className="space-y-1.5 ml-4 list-disc list-outside text-sm">
                <li>I have explained this declaration to the patient</li>
                <li>The patient has confirmed that he/she has carefully considered his/her responses and believe them to be complete and correct</li>
                <li>The patient has declared to me that he/she has not withheld any relevant information or made any misleading statement</li>
                <li>He/she has provided his/her consent for me, as the examining medical practitioner, to communicate with any physician who has previously attended to him/her</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Medical Examination */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-gray-900 bg-gray-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-gray-200">Medical Examination</h3>
        
        {/* Test Results */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Test Results</h4>
          <div className="space-y-2 text-sm">
            {/* Chest X-ray */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Chest X-ray</span>
              <span className={
                formData.chestXray && formData.chestXray !== 'normal' 
                  ? 'font-semibold text-red-600' 
                  : 'text-gray-600'
              }>
                {formData.chestXray ? getChestXrayLabel(formData.chestXray) : 'Not specified'}
              </span>
            </div>

            {/* Syphilis */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Syphilis</span>
              <span className={
                formData.syphilis === 'positive-infectious' 
                  ? 'font-semibold text-red-600' 
                  : formData.syphilis === 'positive-treated'
                  ? 'font-semibold text-amber-600'
                  : 'text-gray-600'
              }>
                {formData.syphilis ? getSyphilisLabel(formData.syphilis) : 'Not specified'}
              </span>
            </div>

            {/* All Other Tests */}
            {relevantTests.map((test) => {
              const isAbnormal = formData[`test_${test.key}`] === 'yes';
              return (
                <div key={test.key} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">{test.label}</span>
                  <span className={isAbnormal ? 'font-semibold text-red-600' : 'text-gray-600'}>
                    {isAbnormal ? test.checkboxLabel : test.normalLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Other Abnormalities */}
        {formData.otherAbnormalities && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Other Abnormalities</h4>
            <div className="text-sm bg-gray-50 p-3 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.otherAbnormalities}</p>
            </div>
          </div>
        )}
      </div>

      {/* Overall Result */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Overall Result of Medical Examination</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-900">Is this patient fit for work?</p>
            {formData.fitForWork === 'yes' ? (
              <Badge className="bg-green-600 text-white hover:bg-green-700">Yes</Badge>
            ) : formData.fitForWork === 'no' ? (
              <Badge variant="destructive">No</Badge>
            ) : (
              <p className="text-sm text-gray-500">Not specified</p>
            )}
          </div>
          
          {formData.fitForWork && (
            <div className={`p-4 rounded-lg border ${
              formData.fitForWork === 'yes' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`font-semibold ${
                formData.fitForWork === 'yes' ? 'text-green-700' : 'text-red-700'
              }`}>
                {formData.fitForWork === 'yes' ? '✓' : '✗'} The patient is{' '}
                {formData.fitForWork === 'yes' ? 'fit for work' : 'NOT fit for work'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
