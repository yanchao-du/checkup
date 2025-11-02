/**
 * Validation utilities for medical exam forms
 */

import { ERROR_MESSAGES } from './constants';

export const MEDICAL_HISTORY_ITEMS = [
  'arthritisJointDisease',
  'asthmaBronchitisCopd',
  'chestPain',
  'deafness',
  'diabetes',
  'difficultySeeing',
  'epilepsySeizuresFaints',
  'eyeTrouble',
  'headachesMigraine',
  'headInjuryConcussion',
  'heartAttackDisease',
  'highBloodPressure',
  'muscleDiseaseWeakness',
  'palpitationsBreathlessness',
  'psychiatricIllness',
  'strokeTia',
  'surgicalOperations',
  'thyroidDisease',
  'otherRelevant',
] as const;

export const MEDICAL_DECLARATION_ITEMS = [
  'consultingPractitioner',
  'takingMedication',
  'hospitalAdmission',
  'rehabilitativeTreatment',
  'driverRehabilitation',
  'otherMedicalProblems',
] as const;

/**
 * Validates that all checked medical history items have remarks
 * @param formData The form data object
 * @param onValidate Callback to set validation errors
 * @returns true if validation passes, false otherwise
 */
export function validateMedicalHistory(
  formData: Record<string, any>,
  onValidate?: (field: string, error: string) => void
): boolean {
  const history = formData.medicalHistory || {};
  let isValid = true;
  let firstErrorField: string | null = null;

  for (const item of MEDICAL_HISTORY_ITEMS) {
    if (history[item] === true && !history[`${item}Remarks`]?.trim()) {
      if (onValidate) {
        onValidate(`medicalHistory${item}Remarks`, ERROR_MESSAGES.REMARKS_REQUIRED);
      }
      if (!firstErrorField) {
        firstErrorField = `${item}-remarks`;
      }
      isValid = false;
    }
  }

  // Check patient certification
  if (!history.patientCertification) {
    if (!firstErrorField) {
      firstErrorField = 'medicalHistoryPatientCertification';
    }
    isValid = false;
  }

  // Scroll to first error if validation failed
  if (!isValid && firstErrorField) {
    setTimeout(() => {
      const element = document.getElementById(firstErrorField!);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }, 100);
  }

  return isValid;
}

/**
 * Validates that remarks are provided when any medical declaration is checked
 * @param formData The form data object
 * @param onValidate Callback to set validation errors
 * @returns true if validation passes, false otherwise
 */
export function validateMedicalDeclaration(
  formData: Record<string, any>,
  onValidate?: (field: string, error: string) => void
): boolean {
  const declaration = formData.medicalDeclaration || {};
  const hasAnyDeclaration = MEDICAL_DECLARATION_ITEMS.some(item => declaration[item] === true);

  // Validate remarks if any declaration is checked
  if (hasAnyDeclaration && !declaration.remarks?.trim()) {
    if (onValidate) {
      onValidate('medicalDeclarationRemarks', ERROR_MESSAGES.REMARKS_REQUIRED);
    }
    
    // Scroll to remarks field
    setTimeout(() => {
      const element = document.getElementById('declarationRemarks');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }, 100);
    
    return false;
  }

  return true;
}

/**
 * Checks if patient certification checkbox is checked in Medical Declaration
 * @param formData The form data object
 * @returns true if patient certification is checked, false otherwise
 */
export function isPatientCertificationChecked(formData: Record<string, any>): boolean {
  const declaration = formData.medicalDeclaration || {};
  return declaration.patientCertification === true;
}

/**
 * Checks if patient certification checkbox is checked in Medical History
 * @param formData The form data object
 * @returns true if patient certification is checked, false otherwise
 */
export function isMedicalHistoryPatientCertificationChecked(formData: Record<string, any>): boolean {
  const history = formData.medicalHistory || {};
  return history.patientCertification === true;
}

/**
 * Abnormality checklist items for driver exams
 */
const ABNORMALITY_ITEMS = [
  'abdomen',
  'abnormalityJointMovement',
  'alcoholDrugAddiction',
  'cognitiveImpairment',
  'colourPerception',
  'defectInHearing',
  'deformitiesPhysicalDisabilities',
  'fingerNoseCoordination',
  'limitationLimbStrength',
  'lungs',
  'nervousSystem',
  'neuroMuscularSystem',
  'psychiatricDisorder',
];

/**
 * Validates that remarks are provided for any checked abnormality items
 * @param formData The form data object
 * @param onValidate Callback to set validation errors
 * @returns true if validation passes, false otherwise
 */
export function validateAbnormalityChecklist(
  formData: Record<string, any>,
  onValidate?: (field: string, error: string) => void
): boolean {
  const checklist = formData.abnormalityChecklist || {};
  let isValid = true;
  let firstErrorField: string | null = null;

  for (const item of ABNORMALITY_ITEMS) {
    if (checklist[item] === true && !checklist[`${item}Remarks`]?.trim()) {
      if (onValidate) {
        onValidate(`${item}Remarks`, ERROR_MESSAGES.REMARKS_REQUIRED);
      }
      if (!firstErrorField) {
        firstErrorField = `${item}-remarks`;
      }
      isValid = false;
    }
  }

  // Scroll to first error if validation failed
  if (!isValid && firstErrorField) {
    setTimeout(() => {
      const element = document.getElementById(firstErrorField!);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }, 100);
  }

  return isValid;
}
