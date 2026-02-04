import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/di/container";
import { downloadReportSchema } from "@/application/validators/schemas/reportSchemas";
import { ReportNotFoundError } from "@/domain/errors/ReportNotFoundError";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = downloadReportSchema.safeParse({ id });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid report ID", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const container = getContainer();
    const report = await container.getReportUseCase.execute(validation.data);

    if (!report.pdfUrl) {
      return NextResponse.json(
        { error: "PDF not yet generated" },
        { status: 404 }
      );
    }

    return NextResponse.redirect(report.pdfUrl);
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error downloading report:", error);
    return NextResponse.json(
      { error: "Failed to download report" },
      { status: 500 }
    );
  }
}
