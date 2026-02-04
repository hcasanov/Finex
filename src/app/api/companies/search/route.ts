import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/di/container";
import { searchCompaniesSchema } from "@/application/validators/schemas/companySchemas";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") ?? "";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 10;

    const validation = searchCompaniesSchema.safeParse({ query, limit });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const container = getContainer();
    const result = await container.searchCompaniesUseCase.execute(validation.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching companies:", error);
    return NextResponse.json(
      { error: "Failed to search companies" },
      { status: 500 }
    );
  }
}
