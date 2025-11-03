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

/**
 * Validates mandatory fields in General Medical Examination section
 * @param formData The form data object
 * @param onValidate Callback to set validation errors
 * @returns true if validation passes, false otherwise
 */
export function validateGeneralMedical(
  formData: Record<string, any>,
  onValidate?: (field: string, error: string) => void
): boolean {
  let isValid = true;
  let firstErrorField: string | null = null;

  // Validate Blood Pressure
  if (!formData.bloodPressure?.trim()) {
    if (onValidate) {
      onValidate('bloodPressure', ERROR_MESSAGES.FIELD_REQUIRED);
    }
    if (!firstErrorField) {
      firstErrorField = 'bloodPressure';
    }
    isValid = false;
  }

  // Validate Pulse
  if (!formData.pulse?.trim()) {
    if (onValidate) {
      onValidate('pulse', ERROR_MESSAGES.FIELD_REQUIRED);
    }
    if (!firstErrorField) {
      firstErrorField = 'pulse';
    }
    isValid = false;
  }

  // Validate Optical Aids
  if (formData.opticalAids === undefined || formData.opticalAids === null || formData.opticalAids === '') {
    if (onValidate) {
      onValidate('opticalAids', ERROR_MESSAGES.FIELD_REQUIRED);
    }
    if (!firstErrorField) {
      firstErrorField = 'opticalAids';
    }
    isValid = false;
  }

  // Validate Visual Acuity (should have format "RE: X, LE: Y")
  if (!formData.visualAcuity?.trim() || !formData.visualAcuity.includes('RE:') || !formData.visualAcuity.includes('LE:')) {
    if (onValidate) {
      onValidate('visualAcuity', ERROR_MESSAGES.FIELD_REQUIRED);
    }
    if (!firstErrorField) {
      firstErrorField = 'visualAcuity-re';
    }
    isValid = false;
  }

  // Validate Near Vision RE
  if (!formData.nearVisionRE?.trim()) {
    if (onValidate) {
      onValidate('nearVisionRE', ERROR_MESSAGES.FIELD_REQUIRED);
    }
    if (!firstErrorField) {
      firstErrorField = 'nearVision-re';
    }
    isValid = false;
  }

  // Validate Near Vision LE
  if (!formData.nearVisionLE?.trim()) {
    if (onValidate) {
      onValidate('nearVisionLE', ERROR_MESSAGES.FIELD_REQUIRED);
    }
    if (!firstErrorField) {
      firstErrorField = 'nearVision-le';
    }
    isValid = false;
  }

  // Validate General Condition (pass/fail)
  if (formData.passGeneralCondition === undefined || formData.passGeneralCondition === null || formData.passGeneralCondition === '') {
    if (onValidate) {
      onValidate('passGeneralCondition', ERROR_MESSAGES.FIELD_REQUIRED);
    }
    if (!firstErrorField) {
      firstErrorField = 'passGeneralCondition';
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
 * Validates the vocational X-ray section
 * @param formData The form data object
 * @param onValidate Callback to set validation errors
 * @returns true if validation passes, false otherwise
 */
export function validateVocationalXray(
  formData: Record<string, any>,
  onValidate?: (field: string, error: string) => void
): boolean {
  let isValid = true;
  let firstErrorField: string | null = null;

  // Validate X-ray required question
  if (!formData.vocationalXrayRequired) {
    if (onValidate) {
      onValidate('vocationalXrayRequired', ERROR_MESSAGES.FIELD_REQUIRED);
    }
    if (!firstErrorField) {
      firstErrorField = 'vocationalXrayRequired';
    }
    isValid = false;
  }

  // If X-ray is required (yes), validate findings
  if (formData.vocationalXrayRequired === 'yes') {
    if (!formData.vocationalXrayFindings) {
      if (onValidate) {
        onValidate('vocationalXrayFindings', ERROR_MESSAGES.FIELD_REQUIRED);
      }
      if (!firstErrorField) {
        firstErrorField = 'vocationalXrayFindings';
      }
      isValid = false;
    }
  }

  // Validate memo requirements follow-up questions
  const memoRequirements = formData.memoRequirements 
    ? (typeof formData.memoRequirements === 'string' 
        ? JSON.parse(formData.memoRequirements) 
        : formData.memoRequirements)
    : {};

  const MEMO_REQUIREMENT_IDS = [
    'amputee',
    'cancerChemoRadio',
    'endStageRenal',
    'hearingProblems',
    'heartSurgeryPacemaker',
    'mentalIllness',
    'stroke',
    'tuberculosis',
  ];

  // For each checked memo requirement, validate the follow-up questions
  MEMO_REQUIREMENT_IDS.forEach(id => {
    if (memoRequirements[id] === true) {
      // Validate "Has memo been provided" question
      const memoProvidedField = `memoProvided_${id}`;
      if (!formData[memoProvidedField]) {
        if (onValidate) {
          onValidate(memoProvidedField, ERROR_MESSAGES.FIELD_REQUIRED);
        }
        if (!firstErrorField) {
          firstErrorField = memoProvidedField;
        }
        isValid = false;
      }

      // If memo was provided (yes), validate "further memo required" question
      if (formData[memoProvidedField] === 'yes') {
        const furtherMemoField = `furtherMemoRequired_${id}`;
        if (!formData[furtherMemoField]) {
          if (onValidate) {
            onValidate(furtherMemoField, ERROR_MESSAGES.FIELD_REQUIRED);
          }
          if (!firstErrorField) {
            firstErrorField = furtherMemoField;
          }
          isValid = false;
        }
      }
    }
  });

  // Scroll to first error if validation failed
  if (!isValid && firstErrorField) {
    setTimeout(() => {
      const element = document.querySelector(`[id*="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  return isValid;
}
