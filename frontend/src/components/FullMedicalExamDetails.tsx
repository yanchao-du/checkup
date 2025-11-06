import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FullMedicalExamDetailsProps {
  submission: any;
}

export function FullMedicalExamDetails({
  submission,
}: FullMedicalExamDetailsProps) {
  const isFemale = submission.patient?.gender === 'F';

  const medicalHistoryConditions = [
    { key: 'cardiovascular', label: 'Cardiovascular disease (e.g. ischemic heart disease)' },
    { key: 'metabolic', label: 'Metabolic disease (diabetes, hypertension)' },
    { key: 'respiratory', label: 'Respiratory disease (e.g. tuberculosis, asthma)' },
    { key: 'gastrointestinal', label: 'Gastrointestinal disease (e.g. peptic ulcer disease)' },
    { key: 'neurological', label: 'Neurological disease (e.g. epilepsy, stroke)' },
    { key: 'mentalHealth', label: 'Mental health condition (e.g. depression)' },
    { key: 'otherMedical', label: 'Other medical condition' },
    { key: 'previousSurgeries', label: 'Previous surgeries' },
    { key: 'longTermMedications', label: 'Long-term medications' },
    { key: 'smokingHistory', label: 'Smoking History (tobacco)' },
    { key: 'lifestyleRiskFactors', label: 'Other lifestyle risk factors or significant family history' },
    { key: 'previousInfections', label: 'Previous infections of concern (e.g. COVID-19)' },
  ];

  const medicalTests = [
    { key: 'hiv', label: 'HIV' },
    { key: 'pregnancy', label: 'Pregnancy', femaleOnly: true },
    { key: 'urineAlbumin', label: 'Urine Albumin' },
    { key: 'urineSugar', label: 'Urine Sugar' },
    { key: 'bloodPressure', label: 'Blood Pressure' },
    { key: 'malaria', label: 'Malaria' },
    { key: 'colourVision', label: 'Colour Vision' },
  ];

  const checkedHistoryConditions = medicalHistoryConditions.filter(
    (condition) => submission.formData?.[`medicalHistory_${condition.key}`] === 'yes'
  );

  const abnormalTests = medicalTests.filter((test) => {
    if (test.femaleOnly && !isFemale) return false;
    return submission.formData?.[`test_${test.key}`] === 'yes';
  });

  const getChestXrayLabel = (value: string) => {
    const labels: Record<string, string> = {
      'normal': 'Normal',
      'no-referral': 'No referral needed',
      'cleared-ntbcc': 'Cleared by NTBCC',
      'pregnancy-exempted': 'Pregnancy Exempted',
    };
    return labels[value] || value;
  };

  const getSyphilisLabel = (value: string) => {
    const labels: Record<string, string> = {
      'normal': 'Normal',
      'positive-infectious': 'Positive - Currently Infectious',
      'positive-treated': 'Positive - Treated Inactive',
    };
    return labels[value] || value;
  };

  return (
    <div className="space-y-6">
      {/* Medical History Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="medical-history">
          <AccordionTrigger className="text-lg font-semibold">
            Medical History of Patient
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            {checkedHistoryConditions.length > 0 ? (
              <div className="space-y-2">
                {checkedHistoryConditions.map((condition) => (
                  <div key={condition.key} className="flex items-start gap-2">
                    <div className="min-w-[20px] mt-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <p className="text-sm">{condition.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No medical history conditions reported</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Medical Examination Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="medical-examination">
          <AccordionTrigger className="text-lg font-semibold">
            Medical Examination
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* Chest X-ray */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Chest X-ray</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={submission.formData?.chestXray === 'normal' ? 'outline' : 'secondary'}>
                  {submission.formData?.chestXray
                    ? getChestXrayLabel(submission.formData.chestXray)
                    : 'Not specified'}
                </Badge>
              </CardContent>
            </Card>

            {/* Syphilis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Syphilis</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    submission.formData?.syphilis === 'normal'
                      ? 'outline'
                      : submission.formData?.syphilis?.startsWith('positive')
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {submission.formData?.syphilis
                    ? getSyphilisLabel(submission.formData.syphilis)
                    : 'Not specified'}
                </Badge>
              </CardContent>
            </Card>

            {/* Abnormal Tests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Abnormal Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {abnormalTests.length > 0 ? (
                  <div className="space-y-2">
                    {abnormalTests.map((test) => (
                      <div key={test.key} className="flex items-center gap-2">
                        <Badge variant="destructive">{test.label}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No abnormal tests</p>
                )}
              </CardContent>
            </Card>

            {/* Other Abnormalities */}
            {submission.formData?.otherAbnormalities && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Other Abnormalities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {submission.formData.otherAbnormalities}
                  </p>
                </CardContent>
              </Card>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Overall Result */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Overall Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium">Fit for work:</p>
            {submission.formData?.fitForWork === 'yes' ? (
              <Badge className="bg-green-500 text-white">Yes</Badge>
            ) : submission.formData?.fitForWork === 'no' ? (
              <Badge variant="destructive">No</Badge>
            ) : (
              <p className="text-sm text-gray-500">Not specified</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
