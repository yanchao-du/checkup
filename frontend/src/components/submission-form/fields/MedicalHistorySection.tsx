import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';

interface MedicalHistorySectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function MedicalHistorySection({ formData, onChange }: MedicalHistorySectionProps) {
  const history = formData.medicalHistory || {};

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onChange('medicalHistory', {
      ...history,
      [field]: checked,
    });
  };

  const handleAllNormal = () => {
    onChange('medicalHistory', {
      palpitationsBreathlessness: false,
      asthmaBronchitisCopd: false,
      highBloodPressure: false,
      heartAttackDisease: false,
      chestPain: false,
      psychiatricIllness: false,
      headachesMigraine: false,
      strokeTia: false,
      epilepsySeizuresFaints: false,
      headInjuryConcussion: false,
      muscleDiseaseWeakness: false,
      arthritisJointDisease: false,
      eyeTrouble: false,
      difficultySeeing: false,
      deafness: false,
      diabetes: false,
      thyroidDisease: false,
      surgicalOperations: false,
      otherRelevant: false,
      other: '',
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

      <div className="space-y-3">
        {historyItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={history[item.id] || false}
              onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
            />
            <Label
              htmlFor={item.id}
              className="text-sm font-normal cursor-pointer"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
