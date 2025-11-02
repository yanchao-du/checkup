import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';

interface MedicalHistorySectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function MedicalHistorySection({ formData, onChange }: MedicalHistorySectionProps) {
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
  };

  const handleAllNormal = () => {
    onChange('medicalHistory', {
      palpitationsBreathlessness: false,
      palpitationsBreathlessnessRemarks: '',
      chestPainDiscomfort: false,
      chestPainDiscomfortRemarks: '',
      highBloodPressure: false,
      highBloodPressureRemarks: '',
      heartAttackBypass: false,
      heartAttackBypassRemarks: '',
      strokeTia: false,
      strokeTiaRemarks: '',
      diabetes: false,
      diabetesRemarks: '',
      epilepsySeizures: false,
      epilepsySeizuresRemarks: '',
      eyeDisorders: false,
      eyeDisordersRemarks: '',
      mentalHealthDisorders: false,
      mentalHealthDisordersRemarks: '',
      alcoholDrugDependence: false,
      alcoholDrugDependenceRemarks: '',
      sleepApnoea: false,
      sleepApnoeaRemarks: '',
      infectiousDisease: false,
      infectiousDiseaseRemarks: '',
      chronicKidneyFailure: false,
      chronicKidneyFailureRemarks: '',
      cancer: false,
      cancerRemarks: '',
      musculoskeletalDisorders: false,
      musculoskeletalDisordersRemarks: '',
      hearingProblems: false,
      hearingProblemsRemarks: '',
      autoimmuneDisorders: false,
      autoimmuneDisordersRemarks: '',
      metabolicDisorders: false,
      metabolicDisordersRemarks: '',
      otherRelevant: false,
      otherRelevantRemarks: '',
    });
  };

  const historyItems = [
    { id: 'palpitationsBreathlessness', label: 'Palpitations or breathlessness' },
    { id: 'asthmaBronchitisCopd', label: 'Asthma / bronchitis / COPD' },
    { id: 'highBloodPressure', label: 'High blood pressure' },
    { id: 'heartAttackDisease', label: 'Heart attack / disease' },
    { id: 'chestPain', label: 'Chest pain on exertion or at night' },
    { id: 'psychiatricIllness', label: 'Psychiatric illness' },
    { id: 'headachesMigraine', label: 'Severe headaches or migraine' },
    { id: 'strokeTia', label: 'Stroke / TIA' },
    { id: 'epilepsySeizuresFaints', label: 'Epilepsy, seizures or fits of any kind / faints' },
    { id: 'headInjuryConcussion', label: 'Head injury or concussion' },
    { id: 'muscleDiseaseWeakness', label: 'Muscle disease or weakness' },
    { id: 'arthritisJointDisease', label: 'Arthritis / joint disease / numbness in hands and fingers' },
    { id: 'eyeTrouble', label: 'Eye trouble of any kind (e.g. cataracts, glaucoma, strabismus)' },
    { id: 'difficultySeeing', label: 'Difficulty seeing in the dark' },
    { id: 'deafness', label: 'Deafness' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'thyroidDisease', label: 'Thyroid disease' },
    { id: 'surgicalOperations', label: 'Surgical operations' },
    { id: 'otherRelevant', label: 'Any relevant medical problems or injuries not mentioned above' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Does the patient have a history of, or is currently suffering from, any of the following?
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleAllNormal}>
          All Normal
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
                  Remarks
                </Label>
                <Textarea
                  id={`${item.id}-remarks`}
                  placeholder="Please provide details..."
                  value={history[`${item.id}Remarks`] || ''}
                  onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
