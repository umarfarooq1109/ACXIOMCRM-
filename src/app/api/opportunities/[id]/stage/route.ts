import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { changeOpportunityStage } from "@/services/opportunity";
import { formatApiError } from "@/lib/errors";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userCtx = await getSessionUser();
    const { id } = await params;
    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const updated = await changeOpportunityStage(id, body, userCtx, ipAddress);

    return NextResponse.json({
      status: 200,
      message: "Opportunity stage updated successfully",
      data: updated,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
