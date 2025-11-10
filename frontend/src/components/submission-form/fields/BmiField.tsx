import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

interface BmiFieldProps {
  height: string;
  weight: string;
}

export function BmiField({ height, weight }: BmiFieldProps) {
  const calculateBMI = (): { value: number | null; category: string; color: string } => {
    if (!height || !weight) {
      return { value: null, category: '', color: '' };
    }

    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);

    if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters === 0) {
      return { value: null, category: '', color: '' };
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    let category = '';
    let color = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-red-700 bg-red-50 border-red-200';
    } else if (bmi >= 18.5 && bmi < 23) {
      category = 'Normal';
      color = 'text-green-700 bg-green-50 border-green-200';
    } else if (bmi >= 23 && bmi < 27.5) {
      category = 'Overweight';
      color = 'text-amber-700 bg-amber-50 border-amber-200';
    } else {
      category = 'Obese';
      color = 'text-red-700 bg-red-50 border-red-200';
    }

    return { value: bmi, category, color };
  };

  const { value: bmiValue, category, color } = calculateBMI();

  return (
    <div className="space-y-2 max-w-xs">
      <Label htmlFor="bmi">BMI</Label>
      <Input
        id="bmi"
        name="bmi"
        type="text"
        value={bmiValue !== null ? bmiValue.toFixed(1) : ''}
        readOnly
        placeholder="Auto-calculated"
        className="bg-gray-50 cursor-not-allowed"
      />
      {bmiValue !== null && category && (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-medium ${color}`}>
          BMI {bmiValue.toFixed(1)} - {category}
          {category === 'Underweight' && ' (BMI < 18.5)'}
          {category === 'Normal' && ' (BMI 18.5-22.9)'}
          {category === 'Overweight' && ' (BMI 23-27.4)'}
          {category === 'Obese' && ' (BMI ≥ 27.5)'}
        </div>
      )}
    </div>
  );
}
