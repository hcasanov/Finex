import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/di/container";
import { getReportSchema } from "@/application/validators/schemas/reportSchemas";
import { ReportNotFoundError } from "@/domain/errors/ReportNotFoundError";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = getReportSchema.safeParse({ id });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid report ID", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const container = getContainer();
    const result = await container.getReportUseCase.execute(validation.data);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
