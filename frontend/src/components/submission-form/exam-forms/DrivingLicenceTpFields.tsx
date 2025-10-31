import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { CommonMedicalFields } from '../fields/CommonMedicalFields';
import { MedicalDeclarationSection } from '../fields/MedicalDeclarationSection';
import { MedicalHistorySection } from '../fields/MedicalHistorySection';
import { AbbreviatedMentalTestSection } from '../fields/AbbreviatedMentalTestSection';
import { AssessmentSection } from '../fields/AssessmentSection';

interface DrivingLicenceTpFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function DrivingLicenceTpFields({
  formData,
  onChange,
  activeSection = 'general-medical',
  onSectionChange,
}: DrivingLicenceTpFieldsProps) {
  return (
    <Accordion
      type="single"
      collapsible
      value={activeSection}
      onValueChange={(value) => onSectionChange?.(value || '')}
      className="w-full"
    >
      {/* General Medical Examination */}
      <AccordionItem value="general-medical">
        <AccordionTrigger className="text-lg font-semibold">
          General Medical Examination
        </AccordionTrigger>
        <AccordionContent>
          <CommonMedicalFields formData={formData} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>

      {/* Medical Declaration by Examinee */}
      <AccordionItem value="medical-declaration">
        <AccordionTrigger className="text-lg font-semibold">
          Medical Declaration by Examinee
        </AccordionTrigger>
        <AccordionContent>
          <MedicalDeclarationSection formData={formData} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>

      {/* Medical History of Examinee */}
      <AccordionItem value="medical-history">
        <AccordionTrigger className="text-lg font-semibold">
          Medical History of Examinee
        </AccordionTrigger>
        <AccordionContent>
          <MedicalHistorySection formData={formData} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>

      {/* Abbreviated Mental Test */}
      <AccordionItem value="amt">
        <AccordionTrigger className="text-lg font-semibold">
          Abbreviated Mental Test (AMT)
        </AccordionTrigger>
        <AccordionContent>
          <AbbreviatedMentalTestSection formData={formData} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>

      {/* Medical Practitioner Assessment */}
      <AccordionItem value="assessment">
        <AccordionTrigger className="text-lg font-semibold">
          Medical Practitioner Assessment
        </AccordionTrigger>
        <AccordionContent>
          <AssessmentSection
            formData={formData}
            onChange={onChange}
            examType="DRIVING_LICENCE_TP"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
