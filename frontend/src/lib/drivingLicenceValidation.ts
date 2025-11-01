/**
 * Validates if the medical examination is conducted within the allowed timeframe
 * based on the patient's driving licence class and date of birth.
 * 
 * Rules:
 * - Class 2B, 2A, 2, 3C(A), 3C, 3A, 3: 
 *   Exam within 2 months before birthdate at ages 65, 68, 71, 74, and every 3 years after
 * - Class 4, 4A, 5:
 *   Exam within 2 months before birthdate at age 65 and every year after until 75
 */

interface ValidationResult {
  isValid: boolean;
  error?: string;
  warningMessage?: string;
  nextRequiredAge?: number;
  nextBirthdayDate?: Date;
}

export function validateDrivingLicenceExamTiming(
  dateOfBirth: string,
  examinationDate: string,
  licenceClass: string
): ValidationResult {
  if (!dateOfBirth || !examinationDate || !licenceClass) {
    return { isValid: true }; // Skip validation if required fields are missing
  }

  const dob = new Date(dateOfBirth);
  const examDate = new Date(examinationDate);
  
  // Calculate patient's age at examination date
  const ageAtExam = examDate.getFullYear() - dob.getFullYear();
  const birthMonth = dob.getMonth();
  const birthDay = dob.getDate();
  const examMonth = examDate.getMonth();
  const examDay = examDate.getDate();
  
  // Adjust age if birthday hasn't occurred yet in the exam year
  const hasHadBirthdayThisYear = 
    examMonth > birthMonth || (examMonth === birthMonth && examDay >= birthDay);
  
  const actualAge = hasHadBirthdayThisYear ? ageAtExam : ageAtExam - 1;

  // Determine which licence class group
  const class2And3Group = ['2B', '2A', '2', '3C(A)', '3C', '3A', '3'];
  const class4And5Group = ['4', '4A', '5'];

  // Check if exam is too early (more than 2 months before turning 65)
  if (actualAge < 65) {
    // Calculate when patient turns 65
    const age65Birthday = new Date(dob);
    age65Birthday.setFullYear(dob.getFullYear() + 65);
    
    // Calculate 2 months before 65th birthday
    const twoMonthsBefore65 = new Date(age65Birthday);
    twoMonthsBefore65.setMonth(age65Birthday.getMonth() - 2);

    if (examDate < twoMonthsBefore65) {
      if (class2And3Group.includes(licenceClass) || class4And5Group.includes(licenceClass)) {
        return {
          isValid: false,
          error: `Examination is too early. For this licence class, the first medical examination can only be conducted within 2 months before the 65th birthday (on or after ${twoMonthsBefore65.toLocaleDateString()}).`
        };
      }
    }
    // If within 2 months before turning 65, allow it
    return { isValid: true };
  }

  // For ages 65 and above, apply specific rules per class

  if (class2And3Group.includes(licenceClass)) {
    return validateClass2And3Timing(dob, examDate, actualAge);
  } else if (class4And5Group.includes(licenceClass)) {
    return validateClass4And5Timing(dob, examDate, actualAge);
  }

  // For other classes (4P, 4AP), no specific restrictions documented
  return { isValid: true };
}

function validateClass2And3Timing(
  dob: Date,
  examDate: Date,
  actualAge: number
): ValidationResult {
  // Required exam ages: 65, 68, 71, 74, then every 3 years (77, 80, 83, ...)
  const requiredAges: number[] = [65, 68, 71, 74];
  
  // Add ages every 3 years after 74 up to a reasonable maximum
  for (let age = 77; age <= 120; age += 3) {
    requiredAges.push(age);
  }

  // Find the nearest required exam age
  let nearestRequiredAge: number | null = null;
  for (const reqAge of requiredAges) {
    if (actualAge >= reqAge - 1 && actualAge <= reqAge) {
      nearestRequiredAge = reqAge;
      break;
    }
  }

  if (!nearestRequiredAge) {
    // Patient is between required exam periods
    const nextRequiredAge = requiredAges.find(age => age > actualAge);
    if (nextRequiredAge) {
      return {
        isValid: false,
        error: `For Class ${getClassDisplay()} licence, medical examination is only required at ages 65, 68, 71, 74, and every 3 years thereafter. Next exam required at age ${nextRequiredAge}.`
      };
    }
  }

  // Check if exam is within 2 months before the birthday
  const nextBirthday = new Date(dob);
  nextBirthday.setFullYear(dob.getFullYear() + nearestRequiredAge!);
  
  const twoMonthsBefore = new Date(nextBirthday);
  twoMonthsBefore.setMonth(nextBirthday.getMonth() - 2);

  if (examDate < twoMonthsBefore) {
    return {
      isValid: false,
      error: `Examination date is too early. For this licence class, exam must be conducted within 2 months before the ${nearestRequiredAge}th birthday (on or after ${twoMonthsBefore.toLocaleDateString()}).`
    };
  }

  if (examDate > nextBirthday) {
    // Exam after birthday - check if it's before next required exam
    const daysSinceBirthday = Math.floor((examDate.getTime() - nextBirthday.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isValid: true,
      nextRequiredAge: nearestRequiredAge ?? undefined,
      nextBirthdayDate: nextBirthday,
      warningMessage: daysSinceBirthday > 30 
        ? `Note: Examination is ${daysSinceBirthday} days after the required birthday. Ensure this is within the valid period.`
        : undefined
    };
  }

  return { 
    isValid: true,
    nextRequiredAge: nearestRequiredAge ?? undefined,
    nextBirthdayDate: nextBirthday
  };
}

function validateClass4And5Timing(
  dob: Date,
  examDate: Date,
  actualAge: number
): ValidationResult {
  // Required every year from 65 to 75
  if (actualAge > 75) {
    return {
      isValid: false,
      error: 'For Class 4, 4A, or 5 licence, annual medical examinations are required only until age 75.'
    };
  }

  // For ages 65-75, exam can be taken within 2 months before any birthday from age 65-75
  // OR anytime after having turned that age (until next year's 2-month window starts)
  
  const examYear = examDate.getFullYear();
  const birthdayThisYear = new Date(dob);
  birthdayThisYear.setFullYear(examYear);
  
  // Check if exam is in valid period for this year's age
  const twoMonthsBeforeThisYear = new Date(birthdayThisYear);
  twoMonthsBeforeThisYear.setMonth(birthdayThisYear.getMonth() - 2);
  
  // Valid if: within 2 months before this year's birthday OR after this year's birthday
  if (examDate >= twoMonthsBeforeThisYear) {
    return { 
      isValid: true,
      nextRequiredAge: actualAge + 1 <= 75 ? actualAge + 1 : undefined,
      nextBirthdayDate: birthdayThisYear
    };
  }
  
  // If not, check if we're in valid period for last year's birthday (if patient already had birthday)
  if (actualAge >= 65) {
    const birthdayLastYear = new Date(dob);
    birthdayLastYear.setFullYear(examYear - 1);
    
    // If we're after last year's birthday, it's valid (annual renewal window)
    if (examDate >= birthdayLastYear) {
      return { 
        isValid: true,
        nextRequiredAge: actualAge + 1 <= 75 ? actualAge + 1 : undefined,
        nextBirthdayDate: birthdayThisYear
      };
    }
  }

  // Otherwise, exam is too early
  return {
    isValid: false,
    error: `Examination date is too early. For Class 4, 4A, or 5 licence, exam must be conducted within 2 months before the birthday (on or after ${twoMonthsBeforeThisYear.toLocaleDateString()}).`
  };
}

function getClassDisplay(): string {
  return '2B, 2A, 2, 3CA, 3C, 3A, or 3';
}

/**
 * Gets a user-friendly message about when the exam should be conducted
 */
export function getDrivingLicenceExamGuidance(
  dateOfBirth: string,
  licenceClass: string
): string | null {
  if (!dateOfBirth || !licenceClass) {
    return null;
  }

  const dob = new Date(dateOfBirth);
  const today = new Date();
  const currentAge = today.getFullYear() - dob.getFullYear();

  const class2And3Group = ['2B', '2A', '2', '3C(A)', '3C', '3A', '3'];
  const class4And5Group = ['4', '4A', '5'];

  if (currentAge < 65) {
    if (class2And3Group.includes(licenceClass)) {
      return 'First medical examination can be conducted within 2 months before your 65th birthday. Subsequent exams required at ages 68, 71, 74, and every 3 years thereafter.';
    } else if (class4And5Group.includes(licenceClass)) {
      return 'First medical examination can be conducted within 2 months before your 65th birthday. Annual examinations required from age 65 to 75.';
    }
  } else {
    if (class2And3Group.includes(licenceClass)) {
      return 'Examination must be within 2 months before your birthday at ages 65, 68, 71, 74, and every 3 years thereafter.';
    } else if (class4And5Group.includes(licenceClass)) {
      return 'Examination must be within 2 months before your birthday, required annually from age 65 to 75.';
    }
  }

  return null;
}
