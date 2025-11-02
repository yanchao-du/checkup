import { AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
import { Button } from '../../ui/button';
import { CommonMedicalFields } from '../fields/CommonMedicalFields';
import { MedicalDeclarationSection } from '../fields/MedicalDeclarationSection';
import { MedicalHistorySection } from '../fields/MedicalHistorySection';
import { VocationalLicenceLtaFields } from '../exam-forms/VocationalLicenceLtaFields';
import { AssessmentSection } from '../fields/AssessmentSection';

interface VocationalLicenceLtaAccordionsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
  completedSections: Set<string>;
  isPatientInfoValid: boolean;
  onContinue: (current: string, next: string) => void;
}

export function VocationalLicenceLtaAccordions({
  formData,
  onChange,
  completedSections,
  isPatientInfoValid,
  onContinue,
}: VocationalLicenceLtaAccordionsProps) {
  return (
    <>
      {/* Medical Declaration by Examinee */}
      <AccordionItem value="medical-declaration">
        <AccordionTrigger isCompleted={completedSections.has('medical-declaration')} isDisabled={!isPatientInfoValid}>
          <div className="flex items-center gap-2">
            <span>Medical Declaration by Examinee</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <MedicalDeclarationSection formData={formData} onChange={onChange} />
            <div className="flex justify-end mt-4">
              <Button 
                type="button"
                onClick={() => onContinue('medical-declaration', 'general-medical')}
              >
                Continue
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* General Medical Examination */}
      <AccordionItem value="general-medical">
        <AccordionTrigger isCompleted={completedSections.has('general-medical')} isDisabled={!completedSections.has('medical-declaration')}>
          <div className="flex items-center gap-2">
            <span>General Medical Examination</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <CommonMedicalFields formData={formData} onChange={onChange} />
            <div className="flex justify-end mt-4">
              <Button 
                type="button"
                onClick={() => onContinue('general-medical', 'medical-history')}
              >
                Continue
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Medical History of Examinee */}
      <AccordionItem value="medical-history">
        <AccordionTrigger isCompleted={completedSections.has('medical-history')} isDisabled={!completedSections.has('general-medical')}>
          <div className="flex items-center gap-2">
            <span>Medical History of Examinee</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <MedicalHistorySection formData={formData} onChange={onChange} />
            <div className="flex justify-end mt-4">
              <Button 
                type="button"
                onClick={() => onContinue('medical-history', 'lta-vocational')}
              >
                Continue
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* LTA Vocational Licence Medical Details */}
      <AccordionItem value="lta-vocational">
        <AccordionTrigger isCompleted={completedSections.has('lta-vocational')} isDisabled={!completedSections.has('medical-history')}>
          <div className="flex items-center gap-2">
            <span>LTA Vocational Licence Medical Details</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <VocationalLicenceLtaFields formData={formData} onChange={onChange} />
            <div className="flex justify-end mt-4">
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
        <AccordionTrigger isCompleted={completedSections.has('assessment')} isDisabled={!completedSections.has('lta-vocational')}>
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
            <div className="flex justify-end mt-4">
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
