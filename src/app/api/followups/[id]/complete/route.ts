import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { completeFollowUp } from "@/services/followup";
import { formatApiError } from "@/lib/errors";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userCtx = await getSessionUser();
    const { id } = await params;
    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const updated = await completeFollowUp(id, body, userCtx, ipAddress);

    return NextResponse.json({
      status: 200,
      message: "Follow-up marked as completed",
      data: updated,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
