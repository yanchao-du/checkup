import {
  Select,
  SelectContent,
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
        <SelectItem value="SIX_MONTHLY_MDW">
          MDW Six-monthly (MOM)
        </SelectItem>
        <SelectItem value="SIX_MONTHLY_FMW">
          FMW Six-monthly (MOM)
        </SelectItem>
        {/* <SelectItem value="WORK_PERMIT">
          Work Permit (MOM)
        </SelectItem> */}
        <SelectItem value="DRIVING_LICENCE_TP">
          Driving Licence (TP)
        </SelectItem>
        <SelectItem value="DRIVING_VOCATIONAL_TP_LTA">
          Driving Vocational (TP/LTA)
        </SelectItem>
        {/* <SelectItem value="VOCATIONAL_LICENCE_LTA">
          Vocational Licence (LTA)
        </SelectItem> */}
        <SelectItem value="PR_MEDICAL">
          PR Medical (ICA)
        </SelectItem>
        <SelectItem value="STUDENT_PASS_MEDICAL">
          Student Pass (ICA)
        </SelectItem>
        <SelectItem value="LTVP_MEDICAL">
          LTVP (ICA)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
