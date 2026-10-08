import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAuditLogs } from "@/services/audit";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userCtx = await getSessionUser();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;
    const entityName = searchParams.get("entityName") || undefined;
    const action = searchParams.get("action") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getAuditLogs(userCtx, { page, limit, entityName, action, search });

    return NextResponse.json({
      status: 200,
      message: "Audit logs retrieved successfully",
      ...result,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
