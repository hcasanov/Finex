export const MetricCategory = {
  REVENUE_PROFITS: "revenue_profits",
  CHARGES_INVESTMENTS: "charges_investments",
  BALANCE_SHEET: "balance_sheet",
  RATIOS: "ratios",
  CASH_FLOW: "cash_flow",
} as const;

export type MetricCategoryType =
  (typeof MetricCategory)[keyof typeof MetricCategory];

export function isValidMetricCategory(
  category: string
): category is MetricCategoryType {
  return Object.values(MetricCategory).includes(category as MetricCategoryType);
}

export const MetricCategoryLabels: Record<MetricCategoryType, string> = {
  [MetricCategory.REVENUE_PROFITS]: "Revenue & Profits",
  [MetricCategory.CHARGES_INVESTMENTS]: "Charges & Investments",
  [MetricCategory.BALANCE_SHEET]: "Balance Sheet",
  [MetricCategory.RATIOS]: "Ratios & Returns",
  [MetricCategory.CASH_FLOW]: "Cash Flow",
};
