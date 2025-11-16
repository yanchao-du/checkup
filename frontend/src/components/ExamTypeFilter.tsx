import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ExamTypeFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ExamTypeFilter({ value, onValueChange }: ExamTypeFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Examination Types</SelectItem>
        
        <SelectGroup>
          <SelectLabel>Ministry of Manpower (MOM)</SelectLabel>
          <SelectItem value="SIX_MONTHLY_MDW">
            Six-monthly Medical Exam (6ME) for Migrant Domestic Worker
          </SelectItem>
          <SelectItem value="SIX_MONTHLY_FMW">
            Six-monthly Medical Exam (6ME) for Female Migrant Worker
          </SelectItem>
          <SelectItem value="FULL_MEDICAL_EXAM">
            Full Medical Examination for Foreign Worker
          </SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Immigration & Checkpoints Authority (ICA)</SelectLabel>
          <SelectItem value="PR_MEDICAL">
            Medical Examination for Permanent Residency
          </SelectItem>
          <SelectItem value="STUDENT_PASS_MEDICAL">
            Medical Examination for Student Pass
          </SelectItem>
          <SelectItem value="LTVP_MEDICAL">
            Medical Examination for Long Term Visit Pass
          </SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Traffic Police (TP) / Land Transport Authority (LTA)</SelectLabel>
          <SelectItem value="DRIVING_VOCATIONAL_TP_LTA">
            Driving Licence / Vocational Licence (Full Form)
          </SelectItem>
          <SelectItem value="DRIVING_VOCATIONAL_TP_LTA_SHORT">
            Driving Licence / Vocational Licence (Short Form)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
