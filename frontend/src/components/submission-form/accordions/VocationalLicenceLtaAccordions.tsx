import { AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
import { Button } from '../../ui/button';
import { CommonMedicalFields } from '../fields/CommonMedicalFields';
import { MedicalDeclarationSection } from '../fields/MedicalDeclarationSection';
import { MedicalHistorySection } from '../fields/MedicalHistorySection';
import { VocationalLicenceLtaFields } from '../exam-forms/VocationalLicenceLtaFields';
import { AssessmentSection } from '../fields/AssessmentSection';
import { 
  validateMedicalDeclaration, 
  validateMedicalHistory, 
  isPatientCertificationChecked,
  isMedicalHistoryPatientCertificationChecked,
  validateAbnormalityChecklist,
  validateGeneralMedical
} from '../utils/validation';

interface VocationalLicenceLtaAccordionsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
  completedSections: Set<string>;
  isPatientInfoValid: boolean;
  onContinue: (current: string, next: string) => void;
  errors?: Record<string, string>;
  onValidate?: (field: string, error: string) => void;
}

export function VocationalLicenceLtaAccordions({
  formData,
  onChange,
  completedSections,
  isPatientInfoValid,
  onContinue,
  errors,
  onValidate,
}: VocationalLicenceLtaAccordionsProps) {
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
            <div className="flex justify-start mt-4">
              <Button 
                type="button"
                disabled={!isPatientCertificationChecked(formData)}
                onClick={() => {
                  if (validateMedicalDeclaration(formData, onValidate)) {
                    onContinue('medical-declaration', 'medical-history');
                  }
                }}
              >
                Continue
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
            <div className="flex justify-start mt-4">
              <Button 
                type="button"
                disabled={!isMedicalHistoryPatientCertificationChecked(formData)}
                onClick={() => {
                  if (validateMedicalHistory(formData, onValidate)) {
                    onContinue('medical-history', 'general-medical');
                  }
                }}
              >
                Continue
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
              isDriverExam={true}
            />
            <div className="flex justify-start mt-4">
              <Button 
                type="button"
                onClick={() => {
                  const isGeneralMedicalValid = validateGeneralMedical(formData, onValidate);
                  const isAbnormalityValid = validateAbnormalityChecklist(formData, onValidate);
                  
                  if (isGeneralMedicalValid && isAbnormalityValid) {
                    onContinue('general-medical', 'lta-vocational');
                  }
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* LTA Vocational Licence Medical Details */}
      <AccordionItem value="lta-vocational">
        <AccordionTrigger isCompleted={completedSections.has('lta-vocational')} isDisabled={!isPatientInfoValid}>
          <div className="flex items-center gap-2">
            <span>LTA Vocational Licence Medical Details</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <VocationalLicenceLtaFields formData={formData} onChange={onChange} />
            <div className="flex justify-start mt-4">
              <Button 
                type="button"
                onClick={() => onContinue('lta-vocational', 'assessment')}
              >
                Continue
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Medical Practitioner Assessment */}
      <AccordionItem value="assessment">
        <AccordionTrigger isCompleted={completedSections.has('assessment')} isDisabled={!isPatientInfoValid}>
          <div className="flex items-center gap-2">
            <span>Medical Practitioner Assessment</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <AssessmentSection 
              formData={formData} 
              onChange={onChange}
              examType="VOCATIONAL_LICENCE_LTA"
            />
            <div className="flex justify-start mt-4">
              <Button 
                type="button"
                onClick={() => onContinue('assessment', 'summary')}
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
