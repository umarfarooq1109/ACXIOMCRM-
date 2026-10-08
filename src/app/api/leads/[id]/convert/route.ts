import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { convertLeadToCustomer } from "@/services/lead";
import { formatApiError } from "@/lib/errors";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userCtx = await getSessionUser();
    const { id } = await params;
    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const result = await convertLeadToCustomer(id, body, userCtx, ipAddress);

    return NextResponse.json({
      status: 200,
      message: "Lead successfully converted to Customer",
      data: result,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
