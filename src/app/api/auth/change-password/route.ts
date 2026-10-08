import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { changeUserPassword } from "@/services/auth";
import { formatApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { status: 401, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await changeUserPassword(session.id, body, ipAddress, userAgent);

    return NextResponse.json({
      status: 200,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
