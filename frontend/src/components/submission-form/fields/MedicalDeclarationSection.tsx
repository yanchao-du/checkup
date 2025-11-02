import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';

interface MedicalDeclarationSectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function MedicalDeclarationSection({ formData, onChange }: MedicalDeclarationSectionProps) {
  const declaration = formData.medicalDeclaration || {};

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onChange('medicalDeclaration', {
      ...declaration,
      [field]: checked,
    });
  };

  const handleClearAll = () => {
    onChange('medicalDeclaration', {
      consultingPractitioner: false,
      takingMedication: false,
      hospitalAdmission: false,
      rehabilitativeTreatment: false,
      otherMedicalProblems: false,
      driverRehabilitation: false,
    });
  };

  const declarations = [
    { id: 'consultingPractitioner', label: 'Currently consulting medical practitioner for pre-existing / newly diagnosed medical condition' },
    { id: 'takingMedication', label: 'Currently taking medication for pre-existing / newly diagnosed medical condition' },
    { id: 'hospitalAdmission', label: 'Being warded or discharged from hospital recently' },
    { id: 'rehabilitativeTreatment', label: 'Been receiving rehabilitative treatment recently (for stroke patients)' },
    { id: 'otherMedicalProblems', label: 'Any relevant medical problems or injuries not mentioned above' },
    { id: 'driverRehabilitation', label: 'Attended any driver rehabilitation and medical fitness assessment programme' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Has the patient experienced or currently experiencing any of the following in the <b>past 6 months?</b>
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleClearAll}>
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {declarations.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={declaration[item.id] || false}
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
