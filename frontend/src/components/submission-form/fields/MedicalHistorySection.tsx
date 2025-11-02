import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';
import { PatientCertificationCheckbox } from './PatientCertificationCheckbox';
import { ERROR_MESSAGES } from '../utils/constants';

interface MedicalHistorySectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
}

export function MedicalHistorySection({ formData, onChange, errors, onValidate }: MedicalHistorySectionProps) {
  const history = formData.medicalHistory || {};

  const handleCheckboxChange = (field: string, checked: boolean) => {
    const newHistory = {
      ...history,
      [field]: checked,
    };
    
    // Clear remarks when unchecking
    if (!checked) {
      newHistory[`${field}Remarks`] = '';
    }
    
    onChange('medicalHistory', newHistory);
  };

  const handleRemarksChange = (field: string, value: string) => {
    onChange('medicalHistory', {
      ...history,
      [`${field}Remarks`]: value,
    });
    
    // Clear error when user starts typing
    if (onValidate && value.trim()) {
      onValidate(`medicalHistory${field}Remarks`, '');
    }
  };

  const handleRemarksBlur = (field: string) => {
    if (onValidate && history[field] && !history[`${field}Remarks`]?.trim()) {
      onValidate(`medicalHistory${field}Remarks`, ERROR_MESSAGES.REMARKS_REQUIRED);
    }
  };

  const handlePatientCertificationChange = (checked: boolean) => {
    onChange('medicalHistory', {
      ...history,
      patientCertification: checked,
    });
  };

  const handleAllNormal = () => {
    // Clear all errors
    if (onValidate) {
      const historyItems = [
        'arthritisJointDisease',
        'asthmaBronchitisCopd',
        'chestPain',
        'deafness',
        'diabetes',
        'difficultySeeing',
        'epilepsySeizuresFaints',
        'eyeTrouble',
        'headachesMigraine',
        'headInjuryConcussion',
        'heartAttackDisease',
        'highBloodPressure',
        'muscleDiseaseWeakness',
        'otherRelevant',
        'palpitationsBreathlessness',
        'psychiatricIllness',
        'strokeTia',
        'surgicalOperations',
        'thyroidDisease',
      ];
      
      historyItems.forEach(item => {
        onValidate(`medicalHistory${item}Remarks`, '');
      });
    }
    
    onChange('medicalHistory', {
      arthritisJointDisease: false,
      arthritisJointDiseaseRemarks: '',
      asthmaBronchitisCopd: false,
      asthmaBronchitisCopRemarks: '',
      chestPain: false,
      chestPainRemarks: '',
      deafness: false,
      deafnessRemarks: '',
      diabetes: false,
      diabetesRemarks: '',
      difficultySeeing: false,
      difficultySeeingRemarks: '',
      epilepsySeizuresFaints: false,
      epilepsySeizuresFaintsRemarks: '',
      eyeTrouble: false,
      eyeTroubleRemarks: '',
      headachesMigraine: false,
      headachesMigraineRemarks: '',
      headInjuryConcussion: false,
      headInjuryConcussionRemarks: '',
      heartAttackDisease: false,
      heartAttackDiseaseRemarks: '',
      highBloodPressure: false,
      highBloodPressureRemarks: '',
      muscleDiseaseWeakness: false,
      muscleDiseaseWeaknessRemarks: '',
      otherRelevant: false,
      otherRelevantRemarks: '',
      palpitationsBreathlessness: false,
      palpitationsBreathlessnessRemarks: '',
      psychiatricIllness: false,
      psychiatricIllnessRemarks: '',
      strokeTia: false,
      strokeTiaRemarks: '',
      surgicalOperations: false,
      surgicalOperationsRemarks: '',
      thyroidDisease: false,
      thyroidDiseaseRemarks: '',
      patientCertification: false,
    });
  };

  const historyItems = [
    { id: 'arthritisJointDisease', label: 'Arthritis / joint disease / numbness in hands and fingers' },
    { id: 'asthmaBronchitisCopd', label: 'Asthma / bronchitis / COPD' },
    { id: 'chestPain', label: 'Chest pain on exertion or at night' },
    { id: 'deafness', label: 'Deafness' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'difficultySeeing', label: 'Difficulty seeing in the dark' },
    { id: 'epilepsySeizuresFaints', label: 'Epilepsy, seizures or fits of any kind / faints' },
    { id: 'eyeTrouble', label: 'Eye trouble of any kind (e.g. cataracts, glaucoma, strabismus)' },
    { id: 'headachesMigraine', label: 'Severe headaches or migraine' },
    { id: 'headInjuryConcussion', label: 'Head injury or concussion' },
    { id: 'heartAttackDisease', label: 'Heart attack / disease' },
    { id: 'highBloodPressure', label: 'High blood pressure' },
    { id: 'muscleDiseaseWeakness', label: 'Muscle disease or weakness' },
    { id: 'palpitationsBreathlessness', label: 'Palpitations or breathlessness' },
    { id: 'psychiatricIllness', label: 'Psychiatric illness' },
    { id: 'strokeTia', label: 'Stroke / TIA' },
    { id: 'surgicalOperations', label: 'Surgical operations' },
    { id: 'thyroidDisease', label: 'Thyroid disease' },
    { id: 'otherRelevant', label: 'Any relevant medical problems or injuries not mentioned above' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Does the patient have a history of, or is currently suffering from, any of the following?
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleAllNormal}>
          Clear All
        </Button>
      </div>

            <ul className="space-y-3">
        {historyItems.map((item) => (
          <li key={item.id}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={history[item.id] || false}
                onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
              />
              <Label
                htmlFor={item.id}
                className={history[item.id] ? 'font-semibold' : ''}
              >
                {item.label}
              </Label>
            </div>
            {history[item.id] && (
              <div className="mt-2 ml-6">
                <Label htmlFor={`${item.id}-remarks`} className="text-sm">
                  Remarks <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id={`${item.id}-remarks`}
                  placeholder="Please provide details..."
                  value={history[`${item.id}Remarks`] || ''}
                  onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                  onBlur={() => handleRemarksBlur(item.id)}
                  className="mt-1"
                  rows={3}
                />
                {errors?.[`medicalHistory${item.id}Remarks`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`medicalHistory${item.id}Remarks`]}
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Patient Certification */}
      <PatientCertificationCheckbox
        id="medicalHistoryPatientCertification"
        checked={history.patientCertification || false}
        onChange={handlePatientCertificationChange}
      />
    </div>
  );
}
