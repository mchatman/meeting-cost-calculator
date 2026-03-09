export interface SalaryPreset {
  role: string;
  hourlyRate: number;
}

export const SALARY_PRESETS: SalaryPreset[] = [
  { role: "Junior Engineer", hourlyRate: 45 },
  { role: "Engineer", hourlyRate: 75 },
  { role: "Senior Engineer", hourlyRate: 95 },
  { role: "Staff Engineer", hourlyRate: 120 },
  { role: "Engineering Manager", hourlyRate: 100 },
  { role: "Product Manager", hourlyRate: 85 },
  { role: "Designer", hourlyRate: 70 },
  { role: "Executive", hourlyRate: 150 },
];
