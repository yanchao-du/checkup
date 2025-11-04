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
            MDW Six-monthly
          </SelectItem>
          <SelectItem value="SIX_MONTHLY_FMW">
            FMW Six-monthly
          </SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Immigration & Checkpoints Authority (ICA)</SelectLabel>
          <SelectItem value="PR_MEDICAL">
            PR Medical
          </SelectItem>
          <SelectItem value="STUDENT_PASS_MEDICAL">
            Student Pass
          </SelectItem>
          <SelectItem value="LTVP_MEDICAL">
            LTVP
          </SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Traffic Police (TP) / Land Transport Authority (LTA)</SelectLabel>
          <SelectItem value="DRIVING_LICENCE_TP">
            Driving Licence (TP)
          </SelectItem>
          <SelectItem value="DRIVING_VOCATIONAL_TP_LTA">
            Driving Vocational (TP/LTA)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
