import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/auth";
import { setSessionCookie } from "@/lib/session";
import { formatApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const userSessionPayload = await registerUser(body, ipAddress, userAgent);
    await setSessionCookie(userSessionPayload);

    return NextResponse.json({
      status: 201,
      message: "Account registered successfully",
      data: userSessionPayload,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
