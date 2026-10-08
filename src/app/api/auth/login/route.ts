import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/services/auth";
import { setSessionCookie } from "@/lib/session";
import { formatApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const userSessionPayload = await loginUser(email, password, ipAddress, userAgent);
    await setSessionCookie(userSessionPayload);

    return NextResponse.json({
      status: 200,
      message: "Login successful",
      data: userSessionPayload,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
