import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getDashboardStats } from "@/services/dashboard";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userCtx = await getSessionUser();
    const stats = await getDashboardStats(userCtx);

    return NextResponse.json({
      status: 200,
      message: "Dashboard stats retrieved successfully",
      data: stats,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
