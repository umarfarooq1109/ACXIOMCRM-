import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { listActivities, createActivity } from "@/services/activity";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userCtx = await getSessionUser();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
    const type = searchParams.get("type") || undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const leadId = searchParams.get("leadId") || undefined;

    const result = await listActivities(userCtx, { page, limit, type, customerId, leadId });

    return NextResponse.json({
      status: 200,
      message: "Activities retrieved successfully",
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

    const activity = await createActivity(body, userCtx, ipAddress);

    return NextResponse.json({
      status: 201,
      message: "Activity logged successfully",
      data: activity,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
