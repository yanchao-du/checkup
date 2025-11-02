import { CheckboxWithRemarksField } from './CheckboxWithRemarksField';

interface AbnormalityChecklistFieldProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
}

const ABNORMALITY_ITEMS = [
  { id: 'abdomen', label: 'Abdomen abnormality' },
  { id: 'abnormalityJointMovement', label: 'Abnormality or limitation in range of movement of the joints (appropriate test e.g. straight leg raise should be conducted)' },
  { id: 'alcoholDrugAddiction', label: 'Evidence of being addicted to the excessive use of alcohol or drug' },
  { id: 'cognitiveImpairment', label: 'Sign of cognitive impairment' },
  { id: 'colourPerception', label: 'Difficulty in accurately recognising the colours red, green and amber (colour perception)' },
  { id: 'defectInHearing', label: 'Defect in hearing' },
  { id: 'deformitiesPhysicalDisabilities', label: 'Deformities and/or physical disabilities observed' },
  { id: 'fingerNoseCoordination', label: 'Finger-nose coordination abnormality' },
  { id: 'limitationLimbStrength', label: 'Limitation in strength of upper limbs and lower limbs (power)' },
  { id: 'lungs', label: 'Lungs abnormality' },
  { id: 'nervousSystem', label: 'Nervous system abnormality' },
  { id: 'neuroMuscularSystem', label: 'Neuro-muscular system abnormality' },
  { id: 'psychiatricDisorder', label: 'Psychiatric disorder' },
];

export function AbnormalityChecklistField({ value, onChange, errors, onValidate }: AbnormalityChecklistFieldProps) {
  return (
    <div className="space-y-2">
      <CheckboxWithRemarksField
        title="Check the boxes for any abnormalities observed during examination"
        items={ABNORMALITY_ITEMS}
        value={value}
        onChange={onChange}
        errors={errors}
        onValidate={onValidate}
        clearAllButtonText="All Normal"
      />
    </div>
  );
}
