import { Label } from '../../ui/label';
import { useEffect, useState } from 'react';

interface AMTRequirementSectionProps {
  drivingLicenseClass: string;
  dateOfBirth: string;
  examinationDate: string;
  cognitiveImpairment: boolean;
  onChange: (field: string, value: any) => void;
  formData: Record<string, any>;
}

export function AMTRequirementSection({
  drivingLicenseClass,
  dateOfBirth,
  examinationDate,
  cognitiveImpairment,
  onChange,
  formData,
}: AMTRequirementSectionProps) {
  const [isAMTRequired, setIsAMTRequired] = useState(false);
  const [requirementReason, setRequirementReason] = useState<string[]>([]);
  const [needsAdditionalInfo, setNeedsAdditionalInfo] = useState(false);

  // Classes that require AMT check for age 70-74
  const AMT_AGE_CHECK_CLASSES = ['4', '4A', '4P', '4AP', '5', '5P'];

  // Calculate age on next birthday
  const calculateAgeOnNextBirthday = (dob: string, examDate: string): number | null => {
    if (!dob || !examDate) return null;
    
    const dobDate = new Date(dob);
    const examDateObj = new Date(examDate);
    
    const nextBirthday = new Date(dobDate);
    nextBirthday.setFullYear(examDateObj.getFullYear());
    
    // If birthday already passed this year, use next year
    if (nextBirthday < examDateObj) {
      nextBirthday.setFullYear(examDateObj.getFullYear() + 1);
    }
    
    return nextBirthday.getFullYear() - dobDate.getFullYear();
  };

  // Calculate age on examination date
  const calculateAgeOnExamDate = (dob: string, examDate: string): number | null => {
    if (!dob || !examDate) return null;
    
    const dobDate = new Date(dob);
    const examDateObj = new Date(examDate);
    
    let age = examDateObj.getFullYear() - dobDate.getFullYear();
    const monthDiff = examDateObj.getMonth() - dobDate.getMonth();
    const dayDiff = examDateObj.getDate() - dobDate.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    const reasons: string[] = [];
    let required = false;

    // Condition 1: Class 4/4A/4P/4AP/5/5P or Private Driving Instructor AND next birthday age 70-74
    if (drivingLicenseClass && dateOfBirth && examinationDate) {
      const ageNextBirthday = calculateAgeOnNextBirthday(dateOfBirth, examinationDate);
      
      if (ageNextBirthday !== null) {
        const isAMTAgeCheckClass = AMT_AGE_CHECK_CLASSES.includes(drivingLicenseClass);
        const isPrivateDrivingInstructor = formData.isPrivateDrivingInstructor === 'yes';
        
        if ((isAMTAgeCheckClass || isPrivateDrivingInstructor) && ageNextBirthday >= 70 && ageNextBirthday <= 74) {
          required = true;
          reasons.push(`Patient holds Class ${drivingLicenseClass}${isPrivateDrivingInstructor ? ' or Private Driving Instructor licence' : ''} and next birthday age is ${ageNextBirthday} (70-74)`);
        }
      }
    }

    // Condition 2: Holder of LTA vocational licence AND aged 70+ on examination date
    if (formData.holdsLTAVocationalLicence === 'yes' && dateOfBirth && examinationDate) {
      const ageOnExamDate = calculateAgeOnExamDate(dateOfBirth, examinationDate);
      
      if (ageOnExamDate !== null && ageOnExamDate >= 70) {
        required = true;
        reasons.push(`Patient holds LTA vocational licence and is aged ${ageOnExamDate} on examination date (70+)`);
      }
    }

    // Condition 3: Shows signs of cognitive impairment
    if (cognitiveImpairment) {
      required = true;
      reasons.push('Patient shows signs of cognitive impairment');
    }

    // Check if we need additional information
    const needsInfo = !!(
      (drivingLicenseClass && dateOfBirth && examinationDate) &&
      (formData.isPrivateDrivingInstructor === undefined || formData.holdsLTAVocationalLicence === undefined)
    );

    setIsAMTRequired(required);
    setRequirementReason(reasons);
    setNeedsAdditionalInfo(needsInfo);
  }, [drivingLicenseClass, dateOfBirth, examinationDate, cognitiveImpairment, formData]);

  return (
    <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
      <h3 className="text-sm font-semibold text-gray-700">Abbreviated Mental Test (AMT) Requirement</h3>
      
      {needsAdditionalInfo && (
        <div className="space-y-4 bg-white p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Additional information required to determine AMT requirement:</p>
          
          {/* Private Driving Instructor */}
          {formData.isPrivateDrivingInstructor === undefined && (
            <div>
              <Label htmlFor="isPrivateDrivingInstructor">
                Is the patient a holder of Private Driving Instructor licence?
              </Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2 text-sm font-normal">
                  <input
                    type="radio"
                    name="isPrivateDrivingInstructor"
                    value="yes"
                    checked={formData.isPrivateDrivingInstructor === 'yes'}
                    onChange={(e) => onChange('isPrivateDrivingInstructor', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center space-x-2 text-sm font-normal">
                  <input
                    type="radio"
                    name="isPrivateDrivingInstructor"
                    value="no"
                    checked={formData.isPrivateDrivingInstructor === 'no'}
                    onChange={(e) => onChange('isPrivateDrivingInstructor', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          )}

          {/* LTA Vocational Licence */}
          {formData.holdsLTAVocationalLicence === undefined && (
            <div>
              <Label htmlFor="holdsLTAVocationalLicence">
                Is the patient a holder of any LTA vocational licence?
              </Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2 text-sm font-normal">
                  <input
                    type="radio"
                    name="holdsLTAVocationalLicence"
                    value="yes"
                    checked={formData.holdsLTAVocationalLicence === 'yes'}
                    onChange={(e) => onChange('holdsLTAVocationalLicence', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center space-x-2 text-sm font-normal">
                  <input
                    type="radio"
                    name="holdsLTAVocationalLicence"
                    value="no"
                    checked={formData.holdsLTAVocationalLicence === 'no'}
                    onChange={(e) => onChange('holdsLTAVocationalLicence', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AMT Requirement Result */}
      <div className={`p-4 rounded-lg border ${isAMTRequired ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
        <div className="flex items-start gap-3">
          <div className={`text-2xl ${isAMTRequired ? 'text-yellow-600' : 'text-green-600'}`}>
            {isAMTRequired ? '⚠️' : '✓'}
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${isAMTRequired ? 'text-yellow-800' : 'text-green-800'}`}>
              {isAMTRequired ? 'AMT is REQUIRED' : 'AMT is NOT required'}
            </p>
            {isAMTRequired && requirementReason.length > 0 && (
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                {requirementReason.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
            {!isAMTRequired && (
              <p className="mt-1 text-sm text-green-700">
                Patient does not meet any criteria for AMT requirement.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
        <p className="font-semibold mb-2">Assessment based on:</p>
        <ul className="space-y-1">
          <li>• License Class: {drivingLicenseClass || 'Not specified'}</li>
          <li>• Date of Birth: {dateOfBirth || 'Not specified'}</li>
          <li>• Examination Date: {examinationDate || 'Not specified'}</li>
          {dateOfBirth && examinationDate && (
            <>
              <li>• Age on examination date: {calculateAgeOnExamDate(dateOfBirth, examinationDate) ?? 'N/A'}</li>
              <li>• Age on next birthday: {calculateAgeOnNextBirthday(dateOfBirth, examinationDate) ?? 'N/A'}</li>
            </>
          )}
          <li>• Cognitive Impairment: {cognitiveImpairment ? 'Yes' : 'No'}</li>
        </ul>
      </div>
    </div>
  );
}
