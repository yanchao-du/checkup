import { Label } from '../../ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../../ui/select';

interface DrivingLicenceClassFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const LICENCE_CATEGORIES = {
  motorcycle: ['2B', '2A', '2'],
  motorCar: ['3', '3A', '3C', '3C(A)'],
  heavyVehicle: ['4', '4P', '4A', '4AP', '5', '5P']
};

export function DrivingLicenceClassField({ value, onChange, required = true }: DrivingLicenceClassFieldProps) {
  return (
    <div className="space-y-2 max-w-sm">
      <Label htmlFor="drivingLicenseClass">Class of Driving Licence {required && <span className="text-red-500">*</span>}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="drivingLicenseClass">
          <SelectValue placeholder="Select driving licence class" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Motorcycle</SelectLabel>
            {LICENCE_CATEGORIES.motorcycle.map((classType) => (
              <SelectItem key={classType} value={classType}>
                Class {classType}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Motor Car</SelectLabel>
            {LICENCE_CATEGORIES.motorCar.map((classType) => (
              <SelectItem key={classType} value={classType}>
                Class {classType}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Heavy Vehicle</SelectLabel>
            {LICENCE_CATEGORIES.heavyVehicle.map((classType) => (
              <SelectItem key={classType} value={classType}>
                Class {classType}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
