import { AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
import { Button } from '../../ui/button';
import { ShortDriverExamAssessment } from '../fields/ShortDriverExamAssessment';

interface DrivingVocationalTpLtaShortAccordionsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  completedSections: Set<string>;
  isPatientInfoValid: boolean;
  isEditingFromSummary?: boolean;
  onContinue: (current: string, next: string) => void;
  errors?: Record<string, string>;
  purposeOfExam?: string;
}

export function DrivingVocationalTpLtaShortAccordions({
  formData,
  onChange,
  completedSections,
  isPatientInfoValid,
  isEditingFromSummary = false,
  onContinue,
  errors = {},
  purposeOfExam,
}: DrivingVocationalTpLtaShortAccordionsProps) {
  
  // Validation function for assessment section
  const validateAssessment = (): boolean => {
    const { fitToDriveMotorVehicle, fitToDrivePsvBavl } = formData;
    
    // Check fitness based on purpose
    if (purposeOfExam === 'AGE_65_ABOVE_TP_ONLY' || 
        purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
        purposeOfExam === 'AGE_64_BELOW_LTA_ONLY') {
      if (!fitToDriveMotorVehicle) return false;
    }
    
    if (purposeOfExam === 'AGE_65_ABOVE_TP_LTA' || 
        purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' ||
        purposeOfExam === 'BAVL_ANY_AGE') {
      if (!fitToDrivePsvBavl) return false;
    }
    
    return true;
  };

  const isAssessmentValid = validateAssessment();

  return (
    <>
      {/* Overall Assessment */}
      <AccordionItem value="overall-assessment">
        <AccordionTrigger 
          isCompleted={completedSections.has('overall-assessment')} 
          isDisabled={!isPatientInfoValid}
        >
          <div className="flex items-center gap-2">
            <span>Overall Assessment</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ShortDriverExamAssessment
              formData={formData}
              onChange={onChange}
              purposeOfExam={purposeOfExam}
              errors={errors}
            />
            <div className="flex justify-start mt-4">
              <Button 
                type="button"
                disabled={!isAssessmentValid}
                onClick={() => {
                  onContinue('overall-assessment', 'summary');
                }}
              >
                {isEditingFromSummary ? 'Continue to Summary' : 'Continue to Review & Submit'}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
