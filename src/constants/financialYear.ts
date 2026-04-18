/**
 * Financial Year Configuration Constants
 */

export interface FinancialYearPreset {
  label: string;
  value: number;
  description: string;
}

export const FINANCIAL_YEAR_PRESETS: FinancialYearPreset[] = [
  { label: "January - December", value: 1, description: "Calendar year (Default)" },
  { label: "February - January", value: 2, description: "Feb start" },
  { label: "March - February", value: 3, description: "Mar start" },
  { label: "April - March", value: 4, description: "Common in UK, India, Japan" },
  { label: "May - April", value: 5, description: "May start" },
  { label: "June - May", value: 6, description: "Jun start" },
  { label: "July - June", value: 7, description: "Common in Australia, New Zealand" },
  { label: "August - July", value: 8, description: "Aug start" },
  { label: "September - August", value: 9, description: "Sep start" },
  { label: "October - September", value: 10, description: "Common in US Government" },
  { label: "November - October", value: 11, description: "Nov start" },
  { label: "December - November", value: 12, description: "Dec start" },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function getFinancialYearLabel(startMonth: number): string {
  if (startMonth < 1 || startMonth > 12) return "Invalid";

  const preset = FINANCIAL_YEAR_PRESETS.find(p => p.value === startMonth);
  return preset ? preset.label : `Custom (${MONTH_NAMES[startMonth - 1]} start)`;
}

export function getFinancialYearDescription(startMonth: number): string {
  if (startMonth < 1 || startMonth > 12) return "";

  const preset = FINANCIAL_YEAR_PRESETS.find(p => p.value === startMonth);
  return preset ? preset.description : "";
}
