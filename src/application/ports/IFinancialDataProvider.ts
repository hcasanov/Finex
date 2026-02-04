export interface CompanyProfile {
  symbol: string;
  name: string;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  country: string | null;
  marketCap: number | null;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
}

export interface CompanySearchResult {
  symbol: string;
  name: string;
  exchange: string | null;
}

export interface FinancialStatement {
  date: string;
  period: string;
  revenue: number | null;
  costOfRevenue: number | null;
  grossProfit: number | null;
  operatingExpenses: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  ebitda: number | null;
  researchAndDevelopmentExpenses: number | null;
}

export interface BalanceSheet {
  date: string;
  period: string;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalStockholdersEquity: number | null;
  totalDebt: number | null;
  cashAndCashEquivalents: number | null;
}

export interface CashFlowStatement {
  date: string;
  period: string;
  operatingCashFlow: number | null;
  capitalExpenditure: number | null;
  freeCashFlow: number | null;
}

export interface KeyMetrics {
  date: string;
  period: string;
  roe: number | null;
  roa: number | null;
  roic: number | null;
  dividendYield: number | null;
}

export interface IFinancialDataProvider {
  searchCompanies(query: string, limit?: number): Promise<CompanySearchResult[]>;
  getCompanyProfile(symbol: string): Promise<CompanyProfile | null>;
  getIncomeStatements(
    symbol: string,
    period?: "annual" | "quarter",
    limit?: number
  ): Promise<FinancialStatement[]>;
  getBalanceSheets(
    symbol: string,
    period?: "annual" | "quarter",
    limit?: number
  ): Promise<BalanceSheet[]>;
  getCashFlowStatements(
    symbol: string,
    period?: "annual" | "quarter",
    limit?: number
  ): Promise<CashFlowStatement[]>;
  getKeyMetrics(
    symbol: string,
    period?: "annual" | "quarter",
    limit?: number
  ): Promise<KeyMetrics[]>;
}
