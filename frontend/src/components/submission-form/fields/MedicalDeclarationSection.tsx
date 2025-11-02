import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';

interface MedicalDeclarationSectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
}

export function MedicalDeclarationSection({ formData, onChange, errors, onValidate }: MedicalDeclarationSectionProps) {
  const declaration = formData.medicalDeclaration || {};

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onChange('medicalDeclaration', {
      ...declaration,
      [field]: checked,
    });
  };

  const handleRemarksChange = (value: string) => {
    onChange('medicalDeclaration', {
      ...declaration,
      remarks: value,
    });
    // Clear error when user starts typing
    if (onValidate && value.trim()) {
      onValidate('medicalDeclarationRemarks', '');
    }
  };

  const handleRemarksBlur = () => {
    if (hasAnyDeclaration && !declaration.remarks?.trim()) {
      if (onValidate) {
        onValidate('medicalDeclarationRemarks', 'Remarks is required when any declaration is selected');
      }
    }
  };

  const handlePatientCertificationChange = (checked: boolean) => {
    onChange('medicalDeclaration', {
      ...declaration,
      patientCertification: checked,
    });
    // Clear error when user checks the box
    if (onValidate && checked) {
      onValidate('medicalDeclarationPatientCertification', '');
    }
  };

  const handleClearAll = () => {
    onChange('medicalDeclaration', {
      consultingPractitioner: false,
      takingMedication: false,
      hospitalAdmission: false,
      rehabilitativeTreatment: false,
      otherMedicalProblems: false,
      driverRehabilitation: false,
      remarks: '',
      patientCertification: false,
    });
  };

  const declarations = [
    { id: 'consultingPractitioner', label: 'Currently consulting a medical practitioner for a pre-existing or newly diagnosed medical condition' },
    { id: 'takingMedication', label: 'Currently taking medication for a pre-existing or newly diagnosed medical condition' },
    { id: 'hospitalAdmission', label: 'Recently warded in or discharged from hospital' },
    { id: 'rehabilitativeTreatment', label: 'Currently receiving or recently received rehabilitative treatment (for stroke patients)' },
    { id: 'driverRehabilitation', label: 'Has attended a driver rehabilitation and medical fitness assessment programme' },
    { id: 'otherMedicalProblems', label: 'Has any other relevant medical problems or injuries not mentioned above' },
  ];

  // Check if any declaration is checked
  const hasAnyDeclaration = declarations.some(item => declaration[item.id] === true);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Please indicate if the patient is currently experiencing or has experienced any of the following <b>in the past 6 months:</b>
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
              className={`text-sm cursor-pointer ${declaration[item.id] ? 'font-semibold' : 'font-normal'}`}
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>

      {/* Mandatory Remarks field when any declaration is checked */}
      {hasAnyDeclaration && (
        <div className="space-y-2 pt-2">
          <Label htmlFor="declarationRemarks" className="text-sm font-medium">
            Remarks <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500">
            Please provide details about the selected declaration(s)
          </p>
          <Textarea
            id="declarationRemarks"
            placeholder="Enter details about the medical condition(s), treatment(s), or circumstances..."
            value={declaration.remarks || ''}
            onChange={(e) => handleRemarksChange(e.target.value)}
            onBlur={handleRemarksBlur}
            rows={4}
            className="resize-none"
            required={hasAnyDeclaration}
          />
          {errors?.medicalDeclarationRemarks && (
            <p className="text-sm text-red-600 font-medium">
              {errors.medicalDeclarationRemarks}
            </p>
          )}
          {declaration.remarks && (
            <p className="text-xs text-gray-500">
              {declaration.remarks.length} characters
            </p>
          )}
        </div>
      )}

      {/* Mandatory Declaration by Patient to Medical Practitioner */}
      <div className="space-y-2 pt-4 border-t">
        <Label className="text-sm font-medium">
          Declaration by Patient to Medical Practitioner <span className="text-red-500">*</span>
        </Label>
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="patientCertification"
              checked={declaration.patientCertification || false}
              onCheckedChange={(checked) => handlePatientCertificationChange(checked as boolean)}
              className="mt-1 bg-white border-2 border-gray-300"
            />
            <div className="flex-1">
              <label htmlFor="patientCertification" className="cursor-pointer block">
                <p className="!text-sm !font-normal !leading-relaxed mb-2">I hereby certify that:</p>
                <ul className="space-y-1.5 ml-4 list-disc list-outside">
                  <li className="!text-sm !font-normal !leading-relaxed">I have explained this declaration to the patient</li>
                  <li className="!text-sm !font-normal !leading-relaxed">The patient has confirmed that he / she has carefully considered his / her responses and believe them to be complete and correct</li>
                  <li className="!text-sm !font-normal !leading-relaxed">The patient has declared to me that he / she has not withheld any relevant information or made any misleading statement</li>
                  <li className="!text-sm !font-normal !leading-relaxed">He / she has provided his / her consent for me, as the examining medical practitioner, to communicate with any physician who has previously attended to him / her</li>
                </ul>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
