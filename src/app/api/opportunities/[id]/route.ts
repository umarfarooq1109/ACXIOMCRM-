import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getOpportunityById, updateOpportunity } from "@/services/opportunity";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userCtx = await getSessionUser();
    const { id } = await params;
    const opportunity = await getOpportunityById(id, userCtx);

    return NextResponse.json({
      status: 200,
      message: "Opportunity details retrieved",
      data: opportunity,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userCtx = await getSessionUser();
    const { id } = await params;
    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const opportunity = await updateOpportunity(id, body, userCtx, ipAddress);

    return NextResponse.json({
      status: 200,
      message: "Opportunity updated successfully",
      data: opportunity,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
