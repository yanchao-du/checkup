import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface DrivingLicenceClassFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const DRIVING_LICENCE_CLASSES = [
  '2B', '2A', '2', '3', '3A', '3C', '3CA', '4', '4P', '4A', '4AP', '5', '5P'
];

export function DrivingLicenceClassField({ value, onChange, required = true }: DrivingLicenceClassFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="drivingLicenseClass">Class of Driving Licence {required && '*'}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="drivingLicenseClass">
          <SelectValue placeholder="Select driving licence class" />
        </SelectTrigger>
        <SelectContent>
          {DRIVING_LICENCE_CLASSES.map((classType) => (
            <SelectItem key={classType} value={classType}>
              {classType}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
