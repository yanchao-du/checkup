import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { CommonMedicalFields } from '../fields/CommonMedicalFields';
import { MedicalDeclarationSection } from '../fields/MedicalDeclarationSection';
import { MedicalHistorySection } from '../fields/MedicalHistorySection';
import { AbbreviatedMentalTestSection } from '../fields/AbbreviatedMentalTestSection';

interface DrivingVocationalTpLtaFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function DrivingVocationalTpLtaFields({
  formData,
  onChange,
  activeSection: externalActiveSection,
  onSectionChange,
}: DrivingVocationalTpLtaFieldsProps) {
  const [internalActiveSection, setInternalActiveSection] = useState<string>('general-medical');
  
  // Use external state if provided, otherwise use internal state
  const activeSection = externalActiveSection !== undefined ? externalActiveSection : internalActiveSection;
  const handleSectionChange = (value: string) => {
    if (onSectionChange) {
      onSectionChange(value);
    } else {
      setInternalActiveSection(value);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={activeSection}
      onValueChange={(value) => handleSectionChange(value || '')}
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
          Medical Declaration by Patient
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

      {/* Abbreviated Mental Test (TP) */}
      <AccordionItem value="amt">
        <AccordionTrigger className="text-lg font-semibold">
          Abbreviated Mental Test (TP)
        </AccordionTrigger>
        <AccordionContent>
          <AbbreviatedMentalTestSection formData={formData} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
