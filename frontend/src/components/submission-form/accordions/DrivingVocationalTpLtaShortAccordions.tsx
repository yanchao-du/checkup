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
    const { fitToDriveMotorVehicle, fitToDrivePsv, fitForBavl } = formData;
    
    // Purpose 1: Age 65+ TP only - requires motor vehicle fitness
    if (purposeOfExam === 'AGE_65_ABOVE_TP_ONLY') {
      if (!fitToDriveMotorVehicle) return false;
    }
    
    // Purpose 2: Age 65+ TP & LTA - requires PSV and BAVL fitness
    if (purposeOfExam === 'AGE_65_ABOVE_TP_LTA') {
      if (!fitToDrivePsv || !fitForBavl) return false;
    }
    
    // Purpose 3: Age 64 below LTA only - requires PSV and BAVL fitness
    if (purposeOfExam === 'AGE_64_BELOW_LTA_ONLY') {
      if (!fitToDrivePsv || !fitForBavl) return false;
    }
    
    // Purpose 4: BAVL any age - requires BAVL fitness only
    if (purposeOfExam === 'BAVL_ANY_AGE') {
      if (!fitForBavl) return false;
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
