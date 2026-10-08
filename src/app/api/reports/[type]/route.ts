import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getReportData } from "@/services/report";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const userCtx = await getSessionUser();
    const { type } = await params;
    const data = await getReportData(type, userCtx);

    return NextResponse.json({
      status: 200,
      message: `${type} report data retrieved`,
      data,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
