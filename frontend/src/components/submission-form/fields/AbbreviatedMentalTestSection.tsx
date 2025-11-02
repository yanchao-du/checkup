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
    { id: 'age', label: '1. Age' },
    { id: 'time', label: '2. Time (to nearest hour)' },
    { id: 'address', label: '3. Address for recall at end of test' },
    { id: 'year', label: '4. Year' },
    { id: 'place', label: '5. Name of place/building' },
    { id: 'recognition', label: '6. Recognition of two persons (doctor, nurse)' },
    { id: 'birthDate', label: '7. Date of birth' },
    { id: 'yearWWI', label: '8. Year of World War I' },
    { id: 'currentLeader', label: '9. Name of current national leader' },
    { id: 'countBackward', label: '10. Count backwards from 20 to 1' },
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
  }, [amt.age, amt.time, amt.address, amt.year, amt.place, amt.recognition, amt.birthDate, amt.yearWWI, amt.currentLeader, amt.countBackward]);

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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">AMT Score</p>
            <p className="text-2xl font-bold text-blue-700">{score}/10</p>
          </div>
          {score < 8 && (
            <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Low AMT score may indicate cognitive impairment</p>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
