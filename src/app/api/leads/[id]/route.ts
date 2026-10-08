import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getLeadById, updateLead } from "@/services/lead";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userCtx = await getSessionUser();
    const { id } = await params;
    const lead = await getLeadById(id, userCtx);

    return NextResponse.json({
      status: 200,
      message: "Lead details retrieved",
      data: lead,
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

    const lead = await updateLead(id, body, userCtx, ipAddress);

    return NextResponse.json({
      status: 200,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
