export interface SalaryPreset {
  role: string;
  hourlyRate: number;
}

export const SALARY_PRESETS: SalaryPreset[] = [
  { role: "Junior Developer", hourlyRate: 45 },
  { role: "Senior Developer", hourlyRate: 85 },
  { role: "Engineering Manager", hourlyRate: 110 },
  { role: "Product Manager", hourlyRate: 95 },
  { role: "Designer", hourlyRate: 70 },
  { role: "QA Engineer", hourlyRate: 55 },
  { role: "VP / Director", hourlyRate: 150 },
  { role: "C-Suite Executive", hourlyRate: 250 },
];

export const CUSTOM_ROLE = "__custom__";
