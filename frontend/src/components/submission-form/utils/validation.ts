/**
 * Validation utilities for medical exam forms
 */

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

  for (const item of MEDICAL_HISTORY_ITEMS) {
    if (history[item] === true && !history[`${item}Remarks`]?.trim()) {
      if (onValidate) {
        onValidate(`medicalHistory${item}Remarks`, 'Remarks is required for this condition');
      }
      isValid = false;
    }
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
      onValidate('medicalDeclarationRemarks', 'Remarks is required when any declaration is selected');
    }
    return false;
  }

  return true;
}

/**
 * Checks if patient certification checkbox is checked
 * @param formData The form data object
 * @returns true if patient certification is checked, false otherwise
 */
export function isPatientCertificationChecked(formData: Record<string, any>): boolean {
  const declaration = formData.medicalDeclaration || {};
  return declaration.patientCertification === true;
}
