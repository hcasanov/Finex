import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/di/container";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // id here is the extraction ID
    const container = getContainer();
    const result = await container.listTasksUseCase.execute(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
