import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { listFollowUps, createFollowUp } from "@/services/followup";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userCtx = await getSessionUser();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const overdue = searchParams.get("overdue") === "true";
    const customerId = searchParams.get("customerId") || undefined;

    const result = await listFollowUps(userCtx, { page, limit, status, type, overdue, customerId });

    return NextResponse.json({
      status: 200,
      message: "Follow-ups retrieved successfully",
      ...result,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userCtx = await getSessionUser();
    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const followUp = await createFollowUp(body, userCtx, ipAddress);

    return NextResponse.json({
      status: 201,
      message: "Follow-up scheduled successfully",
      data: followUp,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
