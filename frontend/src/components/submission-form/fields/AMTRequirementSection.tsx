import { Label } from '../../ui/label';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';
import { Info } from 'lucide-react';

interface AMTRequirementSectionProps {
  drivingLicenseClass: string;
  dateOfBirth: string;
  examinationDate: string;
  cognitiveImpairment: boolean;
  onChange: (field: string, value: any) => void;
  formData: Record<string, any>;
  onRequirementChange?: (isRequired: boolean, canDetermine: boolean) => void;
  autoSetLTAVocational?: boolean; // Indicates if LTA vocational was auto-set based on purpose
}

export function AMTRequirementSection({
  drivingLicenseClass,
  dateOfBirth,
  examinationDate,
  cognitiveImpairment,
  onChange,
  formData,
  onRequirementChange,
  autoSetLTAVocational = false,
}: AMTRequirementSectionProps) {
  const [isAMTRequired, setIsAMTRequired] = useState(false);
  const [requirementReason, setRequirementReason] = useState<string[]>([]);
  const [needsAdditionalInfo, setNeedsAdditionalInfo] = useState(false);
  const [canMakeDetermination, setCanMakeDetermination] = useState(false);
  
  // Check if questions have been shown (persisted in formData)
  const hasShownPrivateDrivingInstructor = formData.hasShownPrivateDrivingInstructor || false;
  const hasShownLTAVocational = formData.hasShownLTAVocational || false;

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
    let needsMoreInfo = false;

    // Condition 3: Shows signs of cognitive impairment (check this first - if true, AMT is required immediately)
    if (cognitiveImpairment) {
      required = true;
      reasons.push('Patient shows signs of cognitive impairment');
    }

    // If already required due to cognitive impairment, no need for additional info
    if (!required && drivingLicenseClass && dateOfBirth && examinationDate) {
      const ageNextBirthday = calculateAgeOnNextBirthday(dateOfBirth, examinationDate);
      const ageOnExamDate = calculateAgeOnExamDate(dateOfBirth, examinationDate);
      
      // Check if age is outside the critical ranges - if so, we can determine AMT is NOT required
      const ageOutsideCriticalRange = (ageNextBirthday !== null && (ageNextBirthday < 70 || ageNextBirthday > 74)) &&
                                      (ageOnExamDate !== null && ageOnExamDate < 70);
      
      if (ageOutsideCriticalRange) {
        // Age is outside all critical ranges, AMT is definitely not required
        required = false;
        needsMoreInfo = false;
      } else {
        // Age is in or near critical range, need to check license details
        
        // Condition 1: Class 4/4A/4P/4AP/5/5P or Private Driving Instructor AND next birthday age 70-74
        if (ageNextBirthday !== null && ageNextBirthday >= 70 && ageNextBirthday <= 74) {
          const isAMTAgeCheckClass = AMT_AGE_CHECK_CLASSES.includes(drivingLicenseClass);
          
          if (isAMTAgeCheckClass) {
            required = true;
            reasons.push(`Patient holds Class ${drivingLicenseClass} and next birthday age is ${ageNextBirthday} (70-74)`);
          } else if (formData.isPrivateDrivingInstructor === 'yes') {
            required = true;
            reasons.push(`Patient holds Private Driving Instructor licence and next birthday age is ${ageNextBirthday} (70-74)`);
          } else if (formData.isPrivateDrivingInstructor === undefined) {
            // Need to know if they're a Private Driving Instructor
            needsMoreInfo = true;
          }
        }

        // Condition 2: Holder of LTA vocational licence AND aged 70+ on examination date
        if (!required && ageOnExamDate !== null && ageOnExamDate >= 70) {
          if (formData.holdsLTAVocationalLicence === 'yes') {
            required = true;
            reasons.push(`Patient holds LTA vocational licence and is aged ${ageOnExamDate} on examination date (70+)`);
          } else if (formData.holdsLTAVocationalLicence === undefined) {
            // Need to know if they hold LTA vocational licence
            needsMoreInfo = true;
          }
        }
        
        // If we need more info, persist that these questions have been shown
        if (needsMoreInfo && (!hasShownPrivateDrivingInstructor || !hasShownLTAVocational)) {
          onChange('hasShownPrivateDrivingInstructor', true);
          onChange('hasShownLTAVocational', true);
        }
      }
    }

    setIsAMTRequired(required);
    setRequirementReason(reasons);
    setNeedsAdditionalInfo(needsMoreInfo);
    setCanMakeDetermination(!needsMoreInfo); // Can only make determination if we don't need more info
    
    // Notify parent about requirement status
    if (onRequirementChange) {
      onRequirementChange(required, !needsMoreInfo);
    }
  }, [drivingLicenseClass, dateOfBirth, examinationDate, cognitiveImpairment, formData, onRequirementChange]);

  return (
    <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700">Abbreviated Mental Test (AMT) Requirement</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-gray-500 cursor-help hover:text-gray-700" />
          </TooltipTrigger>
          <TooltipContent className="max-w-lg bg-gray-900 text-white p-3 !text-[11px]">
            <p className="font-medium mb-2">AMT is required if ANY of the following conditions applies:</p>
            <ul className="space-y-1 leading-relaxed">
              <li>• <strong>Condition 1:</strong> Patient holds Class 4, 4A, 4P, 4AP, 5, 5P or Private Driving Instructor licence AND next birthday age is 70-74</li>
              <li>• <strong>Condition 2:</strong> Patient holds any LTA vocational licence AND is aged 70 or above on examination date</li>
              <li>• <strong>Condition 3:</strong> Patient shows signs of cognitive impairment</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {/* Only show the card if there are actual questions to display */}
      {(hasShownPrivateDrivingInstructor || (hasShownLTAVocational && !autoSetLTAVocational)) && (
        <div className="space-y-4 bg-white p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Additional information required to determine AMT requirement:</p>
          
          {/* Private Driving Instructor */}
          {hasShownPrivateDrivingInstructor && (
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

          {/* LTA Vocational Licence - Only show if not auto-set */}
          {hasShownLTAVocational && !autoSetLTAVocational && (
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

      {/* AMT Requirement Result - only show when we can make a determination */}
      {canMakeDetermination && (
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
      )}

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
          {formData.holdsLTAVocationalLicence && (
            <li>• Holder of LTA vocational licence: {formData.holdsLTAVocationalLicence === 'yes' ? 'Yes' : 'No'}{autoSetLTAVocational && formData.holdsLTAVocationalLicence === 'yes' ? ' (auto-detected from purpose of exam)' : ''}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
