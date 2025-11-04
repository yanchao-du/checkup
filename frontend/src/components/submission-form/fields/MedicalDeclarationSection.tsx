import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';
import { PatientCertificationCheckbox } from './PatientCertificationCheckbox';
import { ERROR_MESSAGES } from '../utils/constants';

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
        onValidate('medicalDeclarationRemarks', ERROR_MESSAGES.REMARKS_REQUIRED);
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
    // Clear the remarks error
    if (onValidate) {
      onValidate('medicalDeclarationRemarks', '');
    }
    
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
        <Button type="button" variant="outline" size="sm" onClick={handleClearAll} className="border-blue-500 text-blue-500 hover:bg-blue-50">
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
            <p className="text-sm text-red-500 mt-1">
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
      <PatientCertificationCheckbox
        checked={declaration.patientCertification || false}
        onChange={handlePatientCertificationChange}
      />
    </div>
  );
}
