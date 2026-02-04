export const METRIC_CATEGORIES = {
  REVENUE_PROFITS: "revenue_profits",
  CHARGES_INVESTMENTS: "charges_investments",
  BALANCE_SHEET: "balance_sheet",
  RATIOS: "ratios",
  CASH_FLOW: "cash_flow",
} as const;

export type MetricCategoryType =
  (typeof METRIC_CATEGORIES)[keyof typeof METRIC_CATEGORIES];

export interface MetricDefinition {
  code: string;
  name: string;
  category: MetricCategoryType;
  description: string;
  unit: "currency" | "percentage" | "ratio" | "number";
}

export const FINANCIAL_METRICS: MetricDefinition[] = [
  // Revenue & Profits
  {
    code: "revenue",
    name: "Revenue",
    category: METRIC_CATEGORIES.REVENUE_PROFITS,
    description: "Total sales revenue",
    unit: "currency",
  },
  {
    code: "gross_margin",
    name: "Gross Margin",
    category: METRIC_CATEGORIES.REVENUE_PROFITS,
    description: "Revenue minus cost of goods sold divided by revenue",
    unit: "percentage",
  },
  {
    code: "operating_income",
    name: "Operating Income",
    category: METRIC_CATEGORIES.REVENUE_PROFITS,
    description: "Earnings before interest and taxes (EBIT)",
    unit: "currency",
  },
  {
    code: "net_income",
    name: "Net Income",
    category: METRIC_CATEGORIES.REVENUE_PROFITS,
    description: "Net profit after all expenses and taxes",
    unit: "currency",
  },
  {
    code: "ebitda",
    name: "EBITDA",
    category: METRIC_CATEGORIES.REVENUE_PROFITS,
    description: "Earnings Before Interest, Taxes, Depreciation, Amortization",
    unit: "currency",
  },

  // Charges & Investments
  {
    code: "opex",
    name: "OPEX",
    category: METRIC_CATEGORIES.CHARGES_INVESTMENTS,
    description: "Operating expenses",
    unit: "currency",
  },
  {
    code: "capex",
    name: "CAPEX",
    category: METRIC_CATEGORIES.CHARGES_INVESTMENTS,
    description: "Capital expenditures",
    unit: "currency",
  },
  {
    code: "rd_expense",
    name: "R&D Expenses",
    category: METRIC_CATEGORIES.CHARGES_INVESTMENTS,
    description: "Research and development expenses",
    unit: "currency",
  },

  // Balance Sheet
  {
    code: "total_assets",
    name: "Total Assets",
    category: METRIC_CATEGORIES.BALANCE_SHEET,
    description: "Total value of all assets",
    unit: "currency",
  },
  {
    code: "total_liabilities",
    name: "Total Liabilities",
    category: METRIC_CATEGORIES.BALANCE_SHEET,
    description: "Total value of all liabilities",
    unit: "currency",
  },
  {
    code: "shareholders_equity",
    name: "Shareholders Equity",
    category: METRIC_CATEGORIES.BALANCE_SHEET,
    description: "Total equity owned by shareholders",
    unit: "currency",
  },
  {
    code: "total_debt",
    name: "Total Debt",
    category: METRIC_CATEGORIES.BALANCE_SHEET,
    description: "Short-term and long-term debt",
    unit: "currency",
  },
  {
    code: "cash",
    name: "Cash",
    category: METRIC_CATEGORIES.BALANCE_SHEET,
    description: "Cash and cash equivalents",
    unit: "currency",
  },

  // Ratios
  {
    code: "roe",
    name: "ROE",
    category: METRIC_CATEGORIES.RATIOS,
    description: "Return on Equity",
    unit: "percentage",
  },
  {
    code: "roa",
    name: "ROA",
    category: METRIC_CATEGORIES.RATIOS,
    description: "Return on Assets",
    unit: "percentage",
  },
  {
    code: "roic",
    name: "ROIC",
    category: METRIC_CATEGORIES.RATIOS,
    description: "Return on Invested Capital",
    unit: "percentage",
  },
  {
    code: "irr",
    name: "IRR",
    category: METRIC_CATEGORIES.RATIOS,
    description: "Internal Rate of Return",
    unit: "percentage",
  },
  {
    code: "dividend_yield",
    name: "Dividend Yield",
    category: METRIC_CATEGORIES.RATIOS,
    description: "Dividend per share divided by stock price",
    unit: "percentage",
  },

  // Cash Flow
  {
    code: "operating_cash_flow",
    name: "Operating Cash Flow",
    category: METRIC_CATEGORIES.CASH_FLOW,
    description: "Cash flow from operating activities",
    unit: "currency",
  },
  {
    code: "free_cash_flow",
    name: "Free Cash Flow",
    category: METRIC_CATEGORIES.CASH_FLOW,
    description: "Operating cash flow minus capital expenditures",
    unit: "currency",
  },
] as const;

export const METRIC_CATEGORY_LABELS: Record<MetricCategoryType, string> = {
  [METRIC_CATEGORIES.REVENUE_PROFITS]: "Revenue & Profits",
  [METRIC_CATEGORIES.CHARGES_INVESTMENTS]: "Charges & Investments",
  [METRIC_CATEGORIES.BALANCE_SHEET]: "Balance Sheet",
  [METRIC_CATEGORIES.RATIOS]: "Ratios & Returns",
  [METRIC_CATEGORIES.CASH_FLOW]: "Cash Flow",
};

export const TASK_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type TaskStatusType = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const EXTRACTION_STEPS = [
  "fetch_documents",
  "vectorize",
  "extract_data",
  "generate_report",
] as const;

export type ExtractionStepType = (typeof EXTRACTION_STEPS)[number];

export const STEP_LABELS: Record<ExtractionStepType, string> = {
  fetch_documents: "Fetching Documents",
  vectorize: "Processing Documents",
  extract_data: "Extracting Data",
  generate_report: "Generating Report",
};

export const API_ROUTES = {
  COMPANIES_SEARCH: "/api/companies/search",
  COMPANY_DETAILS: (symbol: string) => `/api/companies/${symbol}`,
  EXTRACTIONS: "/api/extractions",
  EXTRACTION_DETAILS: (id: string) => `/api/extractions/${id}`,
  EXTRACTION_CANCEL: (id: string) => `/api/extractions/${id}/cancel`,
  TASKS: "/api/tasks",
  TASK_DETAILS: (id: string) => `/api/tasks/${id}`,
  REPORTS: "/api/reports",
  REPORT_DETAILS: (id: string) => `/api/reports/${id}`,
  REPORT_DOWNLOAD: (id: string) => `/api/reports/${id}/download`,
} as const;
