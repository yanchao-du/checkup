import { AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
import { Button } from '../../ui/button';
import { CommonMedicalFields } from '../fields/CommonMedicalFields';
import { MedicalDeclarationSection } from '../fields/MedicalDeclarationSection';
import { MedicalHistorySection } from '../fields/MedicalHistorySection';
import { AbbreviatedMentalTestSection } from '../fields/AbbreviatedMentalTestSection';
import { VocationalXraySection } from '../fields/VocationalXraySection';
import { 
  validateMedicalDeclaration, 
  validateMedicalHistory, 
  isPatientCertificationChecked,
  isMedicalHistoryPatientCertificationChecked,
  validateAbnormalityChecklist,
  validateGeneralMedical,
  validateVocationalXray
} from '../utils/validation';

interface DrivingVocationalTpLtaAccordionsProps {
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
  purposeOfExam?: string;
}

export function DrivingVocationalTpLtaAccordions({
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
  purposeOfExam,
}: DrivingVocationalTpLtaAccordionsProps) {
  // Determine if vocational exam section should be shown
  // Hide if "Age 65 and above - Renew Traffic Police Driving Licence only" is selected
  const showVocationalExam = purposeOfExam !== 'AGE_65_ABOVE_TP_ONLY';

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
              isDriverExam={true}
            />
            <div className="flex justify-start mt-4">
              <Button 
                type="button"
                onClick={() => {
                  const isGeneralMedicalValid = validateGeneralMedical(formData, onValidate);
                  const isAbnormalityValid = validateAbnormalityChecklist(formData, onValidate);
                  
                  if (isGeneralMedicalValid && isAbnormalityValid) {
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
            <div className="flex justify-start mt-4">
              <Button 
                type="button"
                onClick={() => onContinue('amt', showVocationalExam ? 'vocational-xray' : 'summary')}
              >
                {isEditingFromSummary ? 'Continue to Summary' : 'Continue'}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Vocational License Medical Examination - Only show if not TP only */}
      {showVocationalExam && (
        <AccordionItem value="vocational-xray">
          <AccordionTrigger isCompleted={completedSections.has('vocational-xray')} isDisabled={!isPatientInfoValid}>
            <div className="flex items-center gap-2">
              <span>Vocational Licence Medical Examination</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <VocationalXraySection 
                formData={formData} 
                onChange={onChange}
                errors={errors}
                onValidate={onValidate}
              />
              <div className="flex justify-start mt-4">
                <Button 
                  type="button"
                  onClick={() => {
                    if (validateVocationalXray(formData, onValidate)) {
                      onContinue('vocational-xray', 'summary');
                    }
                  }}
                >
                  Continue to Summary
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </>
  );
}
