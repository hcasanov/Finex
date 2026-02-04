import type { ExtractionState } from "../state";
import type { ILLMService } from "@/application/ports/ILLMService";
import type { IStorageService } from "@/application/ports/IStorageService";
import type { IPDFGenerator } from "@/application/ports/IPDFGenerator";
import type { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import type { IReportRepository } from "@/domain/repositories/IReportRepository";
import { Report } from "@/domain/entities/Report";

export function createGenerateReportNode(
  llmService: ILLMService,
  storageService: IStorageService,
  pdfGenerator: IPDFGenerator,
  taskRepository: ITaskRepository,
  reportRepository: IReportRepository
) {
  return async (state: ExtractionState): Promise<Partial<ExtractionState>> => {
    const { extractionId, companyId, companyName, symbol, fiscalYear, extractedMetrics, documents } =
      state;

    // Update task status
    const tasks = await taskRepository.findByExtractionId(extractionId);
    const reportTask = tasks.find((t) => t.stepName === "generate_report");
    if (reportTask) {
      reportTask.start();
      await taskRepository.update(reportTask);
    }

    try {
      // Generate executive summary using LLM
      const summary = await llmService.generateSummary({
        companyName: companyName || symbol,
        fiscalYear,
        metrics: extractedMetrics.map((m) => ({
          name: m.name,
          value: m.value,
          unit: m.unit,
        })),
      });

      // Collect data sources
      const dataSources = Array.from(
        new Set(documents.map((d) => `Financial Modeling Prep - ${d.type}`))
      );

      // Create report entity
      const report = Report.create({
        extractionId,
        companyId,
        title: `${symbol} Financial Report - FY${fiscalYear}`,
        summary,
        extractedMetrics,
        dataSources,
      });

      // Save report to database
      await reportRepository.save(report);

      // Update progress
      if (reportTask) {
        reportTask.updateProgress(50);
        await taskRepository.update(reportTask);
      }

      // Generate PDF
      const pdfBuffer = await pdfGenerator.generate({
        companyName: companyName || symbol,
        companySymbol: symbol,
        fiscalYear,
        summary,
        metrics: extractedMetrics,
        dataSources,
        generatedAt: new Date(),
      });

      // Upload PDF to blob storage
      const uploadResult = await storageService.upload(
        pdfBuffer,
        `reports/${report.id}/report.pdf`,
        { contentType: "application/pdf" }
      );

      // Update report with PDF URL
      report.setPdfUrl(uploadResult.url, uploadResult.size);
      await reportRepository.save(report);

      // Mark task as completed
      if (reportTask) {
        reportTask.complete();
        await taskRepository.update(reportTask);
      }

      return {
        reportId: report.id,
        pdfUrl: uploadResult.url,
        isCompleted: true,
        currentStep: "completed",
      };
    } catch (error) {
      if (reportTask) {
        reportTask.fail(error instanceof Error ? error.message : "Unknown error");
        await taskRepository.update(reportTask);
      }

      return {
        error: error instanceof Error ? error.message : "Failed to generate report",
        currentStep: "error",
      };
    }
  };
}
