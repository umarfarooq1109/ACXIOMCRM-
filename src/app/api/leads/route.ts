import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { listLeads, createLead } from "@/services/lead";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userCtx = await getSessionUser();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const source = searchParams.get("source") || undefined;
    const priority = searchParams.get("priority") || undefined;

    const result = await listLeads(userCtx, { page, limit, search, status, source, priority });

    return NextResponse.json({
      status: 200,
      message: "Leads retrieved successfully",
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

    const lead = await createLead(body, userCtx, ipAddress);

    return NextResponse.json({
      status: 201,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
