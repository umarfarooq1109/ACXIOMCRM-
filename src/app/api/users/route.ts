import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { listUsers } from "@/services/user";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userCtx = await getSessionUser();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const isActive = searchParams.get("isActive") ? searchParams.get("isActive") === "true" : undefined;

    const result = await listUsers(userCtx, { page, limit, search, role, isActive });

    return NextResponse.json({
      status: 200,
      message: "Users retrieved successfully",
      ...result,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
