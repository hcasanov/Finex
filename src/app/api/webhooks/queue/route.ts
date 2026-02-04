import { NextResponse } from "next/server";
import { z } from "zod";
import { getContainer } from "@/infrastructure/di/container";
import { processExtractionJob, type ExtractionJobData } from "@/infrastructure/queue";
import { ReactPDFGenerator } from "@/infrastructure/pdf";

// Schema for validating incoming job data
const jobDataSchema = z.object({
  extractionId: z.string().uuid(),
  companyId: z.string().uuid(),
  companyName: z.string(),
  symbol: z.string(),
  fiscalYear: z.number().int().min(1900).max(2100),
  requestedMetrics: z.array(z.string()).min(1),
});

// Optional auth token for webhook security
const WEBHOOK_SECRET = process.env["WEBHOOK_SECRET"];

export async function POST(request: Request) {
  try {
    // Validate webhook secret if configured
    if (WEBHOOK_SECRET) {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");

      if (token !== WEBHOOK_SECRET) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = jobDataSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid job data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const jobData: ExtractionJobData = parseResult.data;

    // Get dependencies from container
    const container = getContainer();
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
      extractionId: jobData.extractionId,
    });
  } catch (error) {
    console.error("[Webhook] Error processing extraction job:", error);

    return NextResponse.json(
      {
        error: "Failed to process extraction job",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    queue: "extractions",
    timestamp: new Date().toISOString(),
  });
}
