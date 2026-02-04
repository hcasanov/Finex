import { NextResponse } from "next/server";
import { z } from "zod";
import { getContainer } from "@/infrastructure/di/container";
import { processExtractionJob, type ExtractionJobData } from "@/infrastructure/queue";
import { ReactPDFGenerator } from "@/infrastructure/pdf";

// Only enable in development
const isDev = process.env["NODE_ENV"] === "development";

// Schema for validating incoming job data
const jobDataSchema = z.object({
  extractionId: z.string().uuid(),
});

/**
 * Development-only endpoint to manually process a pending extraction job.
 * This is useful when using SimpleQueueService (no Redis) in development.
 *
 * POST /api/dev/process-job
 * Body: { extractionId: "uuid" }
 */
export async function POST(request: Request) {
  if (!isDev) {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = jobDataSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { extractionId } = parseResult.data;

    // Get dependencies from container
    const container = getContainer();

    // Fetch extraction to get job data
    const extraction = await container.extractionRepository.findById(extractionId);
    if (!extraction) {
      return NextResponse.json(
        { error: "Extraction not found" },
        { status: 404 }
      );
    }

    // Fetch company details
    const company = await container.companyRepository.findById(extraction.companyId);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Build job data
    const jobData: ExtractionJobData = {
      extractionId: extraction.id,
      companyId: extraction.companyId,
      companyName: company.name,
      symbol: company.symbol.toString(),
      fiscalYear: extraction.fiscalYear,
      requestedMetrics: extraction.requestedMetrics,
    };

    const pdfGenerator = new ReactPDFGenerator();

    // Process the extraction job
    await processExtractionJob(jobData, {
      extractionRepository: container.extractionRepository,
      financialDataProvider: container.financialDataProvider,
      embeddingService: container.embeddingService,
      llmService: container.llmService,
      storageService: container.storageService,
      pdfGenerator,
      taskRepository: container.taskRepository,
      reportRepository: container.reportRepository,
    });

    return NextResponse.json({
      success: true,
      extractionId,
      message: "Extraction job processed successfully",
    });
  } catch (error) {
    console.error("[Dev API] Error processing extraction job:", error);

    return NextResponse.json(
      {
        error: "Failed to process extraction job",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!isDev) {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Development job processor endpoint",
    usage: "POST with { extractionId: 'uuid' } to process a pending extraction",
  });
}
