import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/di/container";
import { getCompanySchema } from "@/application/validators/schemas/companySchemas";
import { CompanyNotFoundError } from "@/domain/errors/CompanyNotFoundError";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const validation = getCompanySchema.safeParse({ symbol });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid symbol", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const container = getContainer();
    const result = await container.getCompanyDetailsUseCase.execute(validation.data);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CompanyNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 }
    );
  }
}
