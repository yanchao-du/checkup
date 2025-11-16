import { format } from 'date-fns';

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd MMM yyyy');
  } catch {
    return '-';
  }
}

export function formatBoolean(value: any, positiveLabel = 'Yes', negativeLabel = 'No'): string {
  if (value === true || value === 'true') return positiveLabel;
  if (value === false || value === 'false') return negativeLabel;
  return '-';
}

export function maskName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0) + '*'.repeat(Math.max(parts[0].length - 1, 3));
  }
  return parts.map((part, index) => {
    if (index === parts.length - 1) {
      return part;
    }
    return part.charAt(0) + '*'.repeat(Math.max(part.length - 1, 3));
  }).join(' ');
}

export function getTestResult(formData: Record<string, any>, testName: string, positiveFlag: string): string {
  const isPositive = String(formData[positiveFlag]) === 'true';
  if (isPositive) {
    return 'Positive/Reactive';
  }
  return formData[testName] ?? 'Negative/Non-reactive';
}

export function isTestPositive(formData: Record<string, any>, positiveFlag: string): boolean {
  return String(formData[positiveFlag]) === 'true';
}
