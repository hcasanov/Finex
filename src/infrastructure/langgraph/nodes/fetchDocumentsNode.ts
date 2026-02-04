import type { ExtractionState, FetchedDocument } from "../state";
import type { IFinancialDataProvider } from "@/application/ports/IFinancialDataProvider";
import type { ITaskRepository } from "@/domain/repositories/ITaskRepository";

export function createFetchDocumentsNode(
  financialDataProvider: IFinancialDataProvider,
  taskRepository: ITaskRepository
) {
  return async (state: ExtractionState): Promise<Partial<ExtractionState>> => {
    const { extractionId, symbol, fiscalYear } = state;

    // Update task status
    const tasks = await taskRepository.findByExtractionId(extractionId);
    const fetchTask = tasks.find((t) => t.stepName === "fetch_documents");
    if (fetchTask) {
      fetchTask.start();
      await taskRepository.update(fetchTask);
    }

    try {
      const documents: FetchedDocument[] = [];

      // Fetch income statements
      const incomeStatements = await financialDataProvider.getIncomeStatements(
        symbol,
        "annual"
      );
      const incomeStatement = incomeStatements.find(
        (s) => new Date(s.date).getFullYear() === fiscalYear
      );
      if (incomeStatement) {
        documents.push({
          type: "income_statement",
          content: JSON.stringify(incomeStatement, null, 2),
          fiscalYear,
          period: "annual",
        });
      }

      // Fetch balance sheets
      const balanceSheets = await financialDataProvider.getBalanceSheets(
        symbol,
        "annual"
      );
      const balanceSheet = balanceSheets.find(
        (s) => new Date(s.date).getFullYear() === fiscalYear
      );
      if (balanceSheet) {
        documents.push({
          type: "balance_sheet",
          content: JSON.stringify(balanceSheet, null, 2),
          fiscalYear,
          period: "annual",
        });
      }

      // Fetch cash flow statements
      const cashFlows = await financialDataProvider.getCashFlowStatements(
        symbol,
        "annual"
      );
      const cashFlow = cashFlows.find(
        (s) => new Date(s.date).getFullYear() === fiscalYear
      );
      if (cashFlow) {
        documents.push({
          type: "cash_flow",
          content: JSON.stringify(cashFlow, null, 2),
          fiscalYear,
          period: "annual",
        });
      }

      // Fetch key metrics
      const metrics = await financialDataProvider.getKeyMetrics(
        symbol,
        "annual"
      );
      const keyMetrics = metrics.find(
        (m) => new Date(m.date).getFullYear() === fiscalYear
      );
      if (keyMetrics) {
        documents.push({
          type: "key_metrics",
          content: JSON.stringify(keyMetrics, null, 2),
          fiscalYear,
          period: "annual",
        });
      }

      // Mark task as completed
      if (fetchTask) {
        fetchTask.complete();
        await taskRepository.update(fetchTask);
      }

      return {
        documents,
        currentStep: "vectorize",
      };
    } catch (error) {
      if (fetchTask) {
        fetchTask.fail(error instanceof Error ? error.message : "Unknown error");
        await taskRepository.update(fetchTask);
      }

      return {
        error: error instanceof Error ? error.message : "Failed to fetch documents",
        currentStep: "error",
      };
    }
  };
}
