import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { listOpportunities, createOpportunity } from "@/services/opportunity";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userCtx = await getSessionUser();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
    const search = searchParams.get("search") || undefined;
    const stage = searchParams.get("stage") || undefined;
    const status = searchParams.get("status") || undefined;
    const customerId = searchParams.get("customerId") || undefined;

    const result = await listOpportunities(userCtx, { page, limit, search, stage, status, customerId });

    return NextResponse.json({
      status: 200,
      message: "Opportunities retrieved successfully",
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

    const opportunity = await createOpportunity(body, userCtx, ipAddress);

    return NextResponse.json({
      status: 201,
      message: "Opportunity created successfully",
      data: opportunity,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
