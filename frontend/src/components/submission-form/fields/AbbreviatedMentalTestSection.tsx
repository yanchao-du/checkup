import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AMTRequirementSection } from './AMTRequirementSection';

interface AbbreviatedMentalTestSectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  drivingLicenseClass?: string;
  dateOfBirth?: string;
  examinationDate?: string;
}

export function AbbreviatedMentalTestSection({ 
  formData, 
  onChange,
  drivingLicenseClass,
  dateOfBirth,
  examinationDate 
}: AbbreviatedMentalTestSectionProps) {
  const amt = formData.amt || {};
  const [score, setScore] = useState(0);
  const [showAMTQuestions, setShowAMTQuestions] = useState(false);

  const questions = [
    { id: 'year', label: '1. What is the present year? (Western calendar, i.e. 20__)' },
    { id: 'time', label: '2. What time is it now (within 1 hour)?' },
    { id: 'age', label: '3. What is your age? (for Chinese, +1 year is usually the norm and hence acceptable)' },
    { id: 'birthDate', label: '4. What is your date of birth?' },
    { id: 'place', label: '5. Where are we now? (hospital or clinic is acceptable)' },
    { id: 'address', label: '6. What is your home address?' },
    { id: 'currentLeader', label: '7. Who is Singapore\'s present Prime Minister?' },
    { id: 'recognition', label: '8. Show picture of a profession (e.g. a nurse or doctor) and ask what is his/her job.' },
    { id: 'countBackward', label: '9. Count backwards from 20 to 1' },
    { id: 'addressRecall', label: '10. Please recall the memory phrase ("37 Bukit Timah Road")' },
  ];

  // Calculate score whenever AMT data changes
  useEffect(() => {
    let calculatedScore = 0;
    questions.forEach((question) => {
      if (amt[question.id] === true) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    
    // Update formData with score
    onChange('amt', {
      ...amt,
      score: calculatedScore,
    });
  }, [amt.year, amt.time, amt.age, amt.birthDate, amt.place, amt.address, amt.currentLeader, amt.recognition, amt.addressRecall, amt.countBackward]);

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onChange('amt', {
      ...amt,
      [field]: checked,
    });
  };

  const handleAllPassed = () => {
    const allPassed: Record<string, boolean> = {};
    questions.forEach((question) => {
      allPassed[question.id] = true;
    });
    onChange('amt', {
      ...allPassed,
      score: 10,
    });
  };

  const handleAMTRequirementChange = (isRequired: boolean, canDetermine: boolean) => {
    // Only show AMT questions if AMT is required AND we can make that determination
    setShowAMTQuestions(isRequired && canDetermine);
  };

  return (
    <div className="space-y-4">
      {/* AMT Requirement Check */}
      {drivingLicenseClass && dateOfBirth && examinationDate && (
        <AMTRequirementSection
          drivingLicenseClass={drivingLicenseClass}
          dateOfBirth={dateOfBirth}
          examinationDate={examinationDate}
          cognitiveImpairment={formData.abnormalityChecklist?.cognitiveImpairment || false}
          onChange={onChange}
          formData={formData}
          onRequirementChange={handleAMTRequirementChange}
        />
      )}

      {showAMTQuestions && (
        <>
          <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Ask the following questions and check each question if the patient answers correctly (1 point each)
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAllPassed}>
          All Passed
        </Button>
      </div>

          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-sm font-medium text-amber-900">
              📋 <strong>Instruction:</strong> Before asking any questions, say to the patient: "Please remember this phrase - '37 Bukit Timah Road'. I will ask for this memory phrase later."
            </p>
          </div>

      <div className="space-y-3">
        {questions.map((question) => (
          <div key={question.id} className="flex items-center space-x-2">
            <Checkbox
              id={question.id}
              checked={amt[question.id] || false}
              onCheckedChange={(checked) => handleCheckboxChange(question.id, checked as boolean)}
            />
            <Label
              htmlFor={question.id}
              className="text-sm font-normal cursor-pointer"
            >
              {question.label}
            </Label>
          </div>
        ))}
      </div>

      {/* Score Display */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className={`flex flex-col gap-4 ${score < 7 ? 'lg:flex-row lg:items-center lg:justify-between' : 'lg:flex-row lg:items-center lg:gap-6'}`}>
          <div>
            <p className="text-sm font-medium text-blue-900">AMT Score</p>
            <p className="text-2xl font-bold text-blue-700">{score}/10</p>
            <p className={`text-base font-semibold mt-1 lg:hidden ${score >= 7 ? 'text-green-700' : 'text-red-700'}`}>
              {score >= 7 ? 'Patient has passed AMT' : 'Patient has failed AMT'}
            </p>
          </div>
          <p className={`hidden lg:block text-base font-semibold ${score >= 7 ? 'text-green-700' : 'text-red-700'}`}>
            {score >= 7 ? 'Patient has passed AMT' : 'Patient has failed AMT'}
          </p>
          {score < 7 && (
            <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200 max-w-md">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">A score of less than 7 suggests cognitive impairment and may require specialist referral for further diagnosis.</p>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
