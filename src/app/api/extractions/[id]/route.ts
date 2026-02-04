import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/di/container";
import { getExtractionSchema } from "@/application/validators/schemas/extractionSchemas";
import { ExtractionNotFoundError } from "@/domain/errors/ExtractionNotFoundError";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = getExtractionSchema.safeParse({ id });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid extraction ID", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const container = getContainer();
    const result = await container.getExtractionStatusUseCase.execute(
      validation.data
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ExtractionNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error fetching extraction:", error);
    return NextResponse.json(
      { error: "Failed to fetch extraction" },
      { status: 500 }
    );
  }
}
