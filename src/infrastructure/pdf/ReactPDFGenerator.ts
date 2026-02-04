import { renderToBuffer } from "@react-pdf/renderer";
import { FinancialReportTemplate } from "./templates";
import type { IPDFGenerator, PDFReportData } from "@/application/ports/IPDFGenerator";

export class ReactPDFGenerator implements IPDFGenerator {
  async generate(data: PDFReportData): Promise<Buffer> {
    const {
      companySymbol,
      companyName,
      fiscalYear,
      summary,
      metrics,
      dataSources,
      generatedAt,
    } = data;

    // Create the PDF document
    const document = FinancialReportTemplate({
      symbol: companySymbol,
      companyName,
      fiscalYear,
      summary: summary ?? "",
      metrics,
      dataSources,
      generatedAt,
    });

    // Render to buffer
    const buffer = await renderToBuffer(document);

    return Buffer.from(buffer);
  }
}
