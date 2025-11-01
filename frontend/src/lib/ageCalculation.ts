/**
 * Calculate age in years, months, and days from date of birth to a reference date
 * @param dob Date of birth in YYYY-MM-DD format
 * @param referenceDate Reference date in YYYY-MM-DD format (typically examination date)
 * @returns Object with years, months, and days, or null if inputs are invalid
 */
export function calculateAge(dob: string, referenceDate: string): { years: number; months: number; days: number } | null {
  if (!dob || !referenceDate) {
    return null;
  }

  const birthDate = new Date(dob);
  const refDate = new Date(referenceDate);

  if (isNaN(birthDate.getTime()) || isNaN(refDate.getTime())) {
    return null;
  }

  // Check if exam date is before DOB (invalid scenario)
  if (refDate < birthDate) {
    return null;
  }

  let years = refDate.getFullYear() - birthDate.getFullYear();
  let months = refDate.getMonth() - birthDate.getMonth();
  let days = refDate.getDate() - birthDate.getDate();

  // Adjust if days is negative
  if (days < 0) {
    months--;
    // Get the number of days in the previous month
    const previousMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0);
    days += previousMonth.getDate();
  }

  // Adjust if months is negative
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Format age as a human-readable string
 * @param age Age object with years, months, and days
 * @returns Formatted string like "65 years 2 months 15 days"
 */
export function formatAge(age: { years: number; months: number; days: number } | null): string {
  if (!age) {
    return '';
  }

  const parts: string[] = [];

  if (age.years > 0 || (age.months === 0 && age.days === 0)) {
    const yearStr = age.years === 1 ? '1 year' : `${age.years} years`;
    parts.push(yearStr);
  }

  if (age.months > 0) {
    const monthStr = age.months === 1 ? '1 month' : `${age.months} months`;
    parts.push(monthStr);
  }

  if (age.days > 0) {
    const dayStr = age.days === 1 ? '1 day' : `${age.days} days`;
    parts.push(dayStr);
  }

  return parts.join(' ');
}
