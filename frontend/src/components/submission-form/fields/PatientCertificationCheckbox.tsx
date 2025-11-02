import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';

interface PatientCertificationCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function PatientCertificationCheckbox({ checked, onChange, id = 'patientCertification' }: PatientCertificationCheckboxProps) {
  return (
    <div className="space-y-2 pt-4 border-t">
      <Label className="text-sm font-medium">
        Declaration by Patient to Medical Practitioner <span className="text-red-500">*</span>
      </Label>
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex items-start space-x-3">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={(checked) => onChange(checked as boolean)}
            className="mt-1 bg-white border-2 border-gray-300"
          />
          <div className="flex-1">
            <label htmlFor={id} className="cursor-pointer block">
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
  );
}
