import type {
  IFinancialDataProvider,
  CompanyProfile,
  CompanySearchResult,
  FinancialStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyMetrics,
} from "@/application/ports/IFinancialDataProvider";
import { FMPClient } from "./FMPClient";

interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

interface FMPCompanyProfile {
  symbol: string;
  companyName: string;
  exchange: string;
  exchangeShortName: string;
  sector: string;
  industry: string;
  country: string;
  mktCap: number;
  image: string;
  website: string;
  description: string;
}

interface FMPIncomeStatement {
  date: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  ebitda: number;
  researchAndDevelopmentExpenses: number;
}

interface FMPBalanceSheet {
  date: string;
  period: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  totalDebt: number;
  cashAndCashEquivalents: number;
}

interface FMPCashFlowStatement {
  date: string;
  period: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
}

interface FMPKeyMetrics {
  date: string;
  period: string;
  returnOnEquity: number;
  returnOnAssets: number;
  returnOnCapitalEmployed: number;
  dividendYield: number;
}

export class FMPFinancialDataProvider implements IFinancialDataProvider {
  private readonly client: FMPClient;

  constructor(apiKey: string, baseUrl = "https://financialmodelingprep.com/api/v3") {
    this.client = new FMPClient({ apiKey, baseUrl });
  }

  async searchCompanies(
    query: string,
    limit = 10
  ): Promise<CompanySearchResult[]> {
    const results = await this.client.get<FMPSearchResult[]>("/search", {
      query,
      limit: limit.toString(),
    });

    return results.map((item) => ({
      symbol: item.symbol,
      name: item.name,
      exchange: item.exchangeShortName ?? item.stockExchange ?? null,
    }));
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
    const profiles = await this.client.get<FMPCompanyProfile[]>(
      `/profile/${symbol.toUpperCase()}`
    );

    const profile = profiles[0];
    if (!profile) return null;

    return {
      symbol: profile.symbol,
      name: profile.companyName,
      exchange: profile.exchangeShortName ?? profile.exchange ?? null,
      sector: profile.sector ?? null,
      industry: profile.industry ?? null,
      country: profile.country ?? null,
      marketCap: profile.mktCap ?? null,
      logoUrl: profile.image ?? null,
      website: profile.website ?? null,
      description: profile.description ?? null,
    };
  }

  async getIncomeStatements(
    symbol: string,
    period: "annual" | "quarter" = "annual",
    limit = 5
  ): Promise<FinancialStatement[]> {
    const endpoint =
      period === "annual"
        ? `/income-statement/${symbol.toUpperCase()}`
        : `/income-statement/${symbol.toUpperCase()}?period=quarter`;

    const statements = await this.client.get<FMPIncomeStatement[]>(endpoint, {
      limit: limit.toString(),
    });

    return statements.map((stmt) => ({
      date: stmt.date,
      period: stmt.period,
      revenue: stmt.revenue,
      costOfRevenue: stmt.costOfRevenue,
      grossProfit: stmt.grossProfit,
      operatingExpenses: stmt.operatingExpenses,
      operatingIncome: stmt.operatingIncome,
      netIncome: stmt.netIncome,
      ebitda: stmt.ebitda,
      researchAndDevelopmentExpenses: stmt.researchAndDevelopmentExpenses,
    }));
  }

  async getBalanceSheets(
    symbol: string,
    period: "annual" | "quarter" = "annual",
    limit = 5
  ): Promise<BalanceSheet[]> {
    const endpoint =
      period === "annual"
        ? `/balance-sheet-statement/${symbol.toUpperCase()}`
        : `/balance-sheet-statement/${symbol.toUpperCase()}?period=quarter`;

    const sheets = await this.client.get<FMPBalanceSheet[]>(endpoint, {
      limit: limit.toString(),
    });

    return sheets.map((sheet) => ({
      date: sheet.date,
      period: sheet.period,
      totalAssets: sheet.totalAssets,
      totalLiabilities: sheet.totalLiabilities,
      totalStockholdersEquity: sheet.totalStockholdersEquity,
      totalDebt: sheet.totalDebt,
      cashAndCashEquivalents: sheet.cashAndCashEquivalents,
    }));
  }

  async getCashFlowStatements(
    symbol: string,
    period: "annual" | "quarter" = "annual",
    limit = 5
  ): Promise<CashFlowStatement[]> {
    const endpoint =
      period === "annual"
        ? `/cash-flow-statement/${symbol.toUpperCase()}`
        : `/cash-flow-statement/${symbol.toUpperCase()}?period=quarter`;

    const statements = await this.client.get<FMPCashFlowStatement[]>(endpoint, {
      limit: limit.toString(),
    });

    return statements.map((stmt) => ({
      date: stmt.date,
      period: stmt.period,
      operatingCashFlow: stmt.operatingCashFlow,
      capitalExpenditure: stmt.capitalExpenditure,
      freeCashFlow: stmt.freeCashFlow,
    }));
  }

  async getKeyMetrics(
    symbol: string,
    period: "annual" | "quarter" = "annual",
    limit = 5
  ): Promise<KeyMetrics[]> {
    const endpoint =
      period === "annual"
        ? `/key-metrics/${symbol.toUpperCase()}`
        : `/key-metrics/${symbol.toUpperCase()}?period=quarter`;

    const metrics = await this.client.get<FMPKeyMetrics[]>(endpoint, {
      limit: limit.toString(),
    });

    return metrics.map((m) => ({
      date: m.date,
      period: m.period,
      roe: m.returnOnEquity,
      roa: m.returnOnAssets,
      roic: m.returnOnCapitalEmployed,
      dividendYield: m.dividendYield,
    }));
  }
}
