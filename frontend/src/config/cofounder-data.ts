/**
 * Static config for the Co-Founder / Co-Partner section.
 */

export const workInterestOptions = [
  "SaaS",
  "AI / ML",
  "FinTech",
  "EdTech",
  "HealthTech",
  "E-commerce",
  "D2C Brand",
  "Food & Beverage",
  "Real Estate",
  "Marketing & Media",
  "Web3 / Blockchain",
  "Social Impact",
  "Manufacturing",
  "Travel & Hospitality",
  "Gaming",
  "Content Creation",
] as const;

export type ChatPlanId = "WEEKLY" | "MONTHLY" | "QUARTERLY";

export interface ChatPlan {
  id: ChatPlanId;
  label: string;
  price: number; // in rupees
  duration: string;
  perWeek: string;
  highlight?: string;
}

export const chatPlans: ChatPlan[] = [
  { id: "WEEKLY", label: "Weekly", price: 9, duration: "1 Week", perWeek: "₹9 / week" },
  { id: "MONTHLY", label: "Monthly", price: 35, duration: "1 Month", perWeek: "≈ ₹8 / week", highlight: "Popular" },
  { id: "QUARTERLY", label: "Quarterly", price: 100, duration: "3 Months", perWeek: "≈ ₹7.7 / week", highlight: "Best Value" },
];
