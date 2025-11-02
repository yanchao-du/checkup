import { AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
import { Button } from '../../ui/button';
import { CommonMedicalFields } from '../fields/CommonMedicalFields';
import { MedicalDeclarationSection } from '../fields/MedicalDeclarationSection';
import { MedicalHistorySection } from '../fields/MedicalHistorySection';
import { AbbreviatedMentalTestSection } from '../fields/AbbreviatedMentalTestSection';
import { 
  validateMedicalDeclaration, 
  validateMedicalHistory, 
  isPatientCertificationChecked,
  isMedicalHistoryPatientCertificationChecked,
  validateAbnormalityChecklist
} from '../utils/validation';

interface DrivingLicenceTpAccordionsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
  completedSections: Set<string>;
  isPatientInfoValid: boolean;
  isEditingFromSummary?: boolean;
  onContinue: (current: string, next: string) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
  drivingLicenseClass?: string;
  dateOfBirth?: string;
  examinationDate?: string;
}

export function DrivingLicenceTpAccordions({
  formData,
  onChange,
  completedSections,
  isPatientInfoValid,
  isEditingFromSummary = false,
  onContinue,
  errors,
  onValidate,
  drivingLicenseClass,
  dateOfBirth,
  examinationDate,
}: DrivingLicenceTpAccordionsProps) {
  return (
    <>
      {/* Medical Declaration by Examinee */}
      <AccordionItem value="medical-declaration">
        <AccordionTrigger isCompleted={completedSections.has('medical-declaration')} isDisabled={!isPatientInfoValid}>
          <div className="flex items-center gap-2">
            <span>Medical Declaration by Patient</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <MedicalDeclarationSection 
              formData={formData} 
              onChange={onChange} 
              errors={errors}
              onValidate={onValidate}
            />
            <div className="flex justify-end mt-4">
              <Button 
                type="button"
                disabled={!isPatientCertificationChecked(formData)}
                onClick={() => {
                  if (validateMedicalDeclaration(formData, onValidate)) {
                    onContinue('medical-declaration', 'medical-history');
                  }
                }}
              >
                {isEditingFromSummary ? 'Continue to Summary' : 'Continue'}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Medical History of Patient */}
      <AccordionItem value="medical-history">
        <AccordionTrigger isCompleted={completedSections.has('medical-history')} isDisabled={!isPatientInfoValid}>
          <div className="flex items-center gap-2">
            <span>Medical History of Patient</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <MedicalHistorySection 
              formData={formData} 
              onChange={onChange}
              errors={errors}
              onValidate={onValidate}
            />
            <div className="flex justify-end mt-4">
              <Button 
                type="button"
                disabled={!isMedicalHistoryPatientCertificationChecked(formData)}
                onClick={() => {
                  if (validateMedicalHistory(formData, onValidate)) {
                    onContinue('medical-history', 'general-medical');
                  }
                }}
              >
                {isEditingFromSummary ? 'Continue to Summary' : 'Continue'}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* General Medical Examination */}
      <AccordionItem value="general-medical">
        <AccordionTrigger isCompleted={completedSections.has('general-medical')} isDisabled={!isPatientInfoValid}>
          <div className="flex items-center gap-2">
            <span>General Medical Examination</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <CommonMedicalFields 
              formData={formData} 
              onChange={onChange} 
              hideHeightWeightBmi={true} 
              showAbnormalityChecklist={true}
              errors={errors}
              onValidate={onValidate}
            />
            <div className="flex justify-end mt-4">
              <Button 
                type="button"
                onClick={() => {
                  if (validateAbnormalityChecklist(formData, onValidate)) {
                    onContinue('general-medical', 'amt');
                  }
                }}
              >
                {isEditingFromSummary ? 'Continue to Summary' : 'Continue'}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Abbreviated Mental Test (AMT) */}
      <AccordionItem value="amt">
        <AccordionTrigger isCompleted={completedSections.has('amt')} isDisabled={!isPatientInfoValid}>
          <div className="flex items-center gap-2">
            <span>Abbreviated Mental Test (AMT)</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <AbbreviatedMentalTestSection 
              formData={formData} 
              onChange={onChange}
              drivingLicenseClass={drivingLicenseClass}
              dateOfBirth={dateOfBirth}
              examinationDate={examinationDate}
            />
            <div className="flex justify-end mt-4">
              <Button 
                type="button"
                onClick={() => onContinue('amt', 'summary')}
              >
                Continue to Summary
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
