import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

interface VisualAcuityFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const SNELLEN_VALUES = [
  '6/6',
  '6/9',
  '6/12',
  '6/18',
  '6/24',
  '6/36',
  '6/60',
];

export function VisualAcuityField({ value, onChange }: VisualAcuityFieldProps) {
  // Parse the value to extract RE and LE
  const parseValue = () => {
    if (!value) return { re: '', le: '' };
    const match = value.match(/RE:\s*([^,]+),\s*LE:\s*(.+)/);
    if (match) {
      return { re: match[1].trim(), le: match[2].trim() };
    }
    return { re: '', le: '' };
  };

  const { re, le } = parseValue();

  const handleREChange = (newRE: string) => {
    const newValue = `RE: ${newRE}, LE: ${le || ''}`;
    onChange(newValue);
  };

  const handleLEChange = (newLE: string) => {
    const newValue = `RE: ${re || ''}, LE: ${newLE}`;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label>Visual Acuity (Snellen Eye Chart) <span className="text-red-500">*</span></Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Right Eye */}
        <div>
          <Label htmlFor="visualAcuity-re" className="text-sm font-normal">Right Eye (RE)</Label>
          <Select value={re} onValueChange={handleREChange}>
            <SelectTrigger id="visualAcuity-re" className="mt-1 bg-white">
              <SelectValue placeholder="Select RE value" />
            </SelectTrigger>
            <SelectContent>
              {SNELLEN_VALUES.map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Left Eye */}
        <div>
          <Label htmlFor="visualAcuity-le" className="text-sm font-normal">Left Eye (LE)</Label>
          <Select value={le} onValueChange={handleLEChange}>
            <SelectTrigger id="visualAcuity-le" className="mt-1 bg-white">
              <SelectValue placeholder="Select LE value" />
            </SelectTrigger>
            <SelectContent>
              {SNELLEN_VALUES.map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
