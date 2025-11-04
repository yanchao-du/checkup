import { AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
import { SixMonthlyMdwSummary } from '../summary/SixMonthlyMdwSummary';
import { DeclarationSection } from '../summary/DeclarationSection';
import { Button } from '../../ui/button';
import { UserRole } from '../../../types/api';

interface SixMonthlyMdwSummaryAccordionProps {
  formData: Record<string, any>;
  patientName: string;
  patientNric: string;
  examinationDate: string;
  lastRecordedHeight: string;
  lastRecordedWeight: string;
  lastRecordedDate: string;
  requiredTests: {
    pregnancy: boolean;
    syphilis: boolean;
    hiv: boolean;
    chestXray: boolean;
  };
  completedSections: Set<string>;
  isPatientInfoValid: boolean;
  declarationChecked: boolean;
  onDeclarationChange: (checked: boolean) => void;
  userRole: UserRole;
  onEdit: (section: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
}

export function SixMonthlyMdwSummaryAccordion({
  formData,
  patientName,
  patientNric,
  examinationDate,
  lastRecordedHeight,
  lastRecordedWeight,
  lastRecordedDate,
  requiredTests,
  completedSections,
  isPatientInfoValid,
  declarationChecked,
  onDeclarationChange,
  userRole,
  onEdit,
  onSubmit,
  isSaving,
}: SixMonthlyMdwSummaryAccordionProps) {
  return (
    <AccordionItem value="summary">
      <AccordionTrigger isCompleted={completedSections.has('summary')} isDisabled={!isPatientInfoValid || !completedSections.has('exam-specific')}>
        <div className="flex items-center gap-2">
          <span>Review & Submit</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6">
          <SixMonthlyMdwSummary
            formData={formData}
            patientName={patientName}
            patientNric={patientNric}
            examinationDate={examinationDate}
            lastRecordedHeight={lastRecordedHeight}
            lastRecordedWeight={lastRecordedWeight}
            lastRecordedDate={lastRecordedDate}
            requiredTests={requiredTests}
            onEdit={onEdit}
          />
          
          <DeclarationSection
            checked={declarationChecked}
            onChange={onDeclarationChange}
            userRole={userRole}
          />

          <div className="flex justify-end gap-3">
            <Button 
              type="button"
              onClick={onSubmit}
              disabled={!declarationChecked || isSaving}
            >
              {isSaving ? 'Submitting...' : userRole === 'nurse' ? 'Route for Approval' : 'Submit to MOM'}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
