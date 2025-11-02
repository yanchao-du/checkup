import { CheckboxWithRemarksField } from './CheckboxWithRemarksField';

interface AbnormalityChecklistFieldProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
}

const PHYSICAL_ABNORMALITY_ITEMS = [
  { id: 'abdomen', label: 'Abdomen abnormality' },
  { id: 'abnormalityJointMovement', label: 'Abnormality or limitation in range of movement of the joints (appropriate test e.g. straight leg raise should be conducted)' },
  { id: 'defectInHearing', label: 'Defect in hearing' },
  { id: 'deformitiesPhysicalDisabilities', label: 'Deformities and/or physical disabilities observed' },
  { id: 'colourPerception', label: 'Difficulty in accurately recognising the colours red, green and amber (colour perception)' },
  { id: 'fingerNoseCoordination', label: 'Finger-nose coordination abnormality' },
  { id: 'limitationLimbStrength', label: 'Limitation in strength of upper limbs and lower limbs (power)' },
  { id: 'lungs', label: 'Lungs abnormality' },
  { id: 'nervousSystem', label: 'Nervous system abnormality' },
  { id: 'neuroMuscularSystem', label: 'Neuro-muscular system abnormality' },
];

const MENTAL_COGNITIVE_ABNORMALITY_ITEMS = [
  { id: 'alcoholDrugAddiction', label: 'Evidence of being addicted to the excessive use of alcohol or drug' },
  { id: 'psychiatricDisorder', label: 'Psychiatric disorder' },
  { id: 'cognitiveImpairment', label: 'Sign of cognitive impairment' },
];

export function AbnormalityChecklistField({ value, onChange, errors, onValidate }: AbnormalityChecklistFieldProps) {
  return (
    <div className="space-y-6">
      <div>
        <CheckboxWithRemarksField
          title="Physical Abnormalities - Check the boxes for any physical abnormalities observed during examination"
          items={PHYSICAL_ABNORMALITY_ITEMS}
          value={value}
          onChange={onChange}
          errors={errors}
          onValidate={onValidate}
          clearAllButtonText="Clear All"
        />
      </div>
      
      <div>
        <CheckboxWithRemarksField
          title="Mental & Cognitive Assessment - Check the boxes for any mental or cognitive concerns observed"
          items={MENTAL_COGNITIVE_ABNORMALITY_ITEMS}
          value={value}
          onChange={onChange}
          errors={errors}
          onValidate={onValidate}
          clearAllButtonText="Clear All"
        />
      </div>
    </div>
  );
}
