import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/session";
import { recordAuditLog } from "@/services/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session) {
      const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const userAgent = req.headers.get("user-agent") || "unknown";
      await recordAuditLog({
        userId: session.id,
        action: "LOGOUT",
        entityName: "User",
        recordId: session.id,
        result: "Success",
        ipAddress,
        userAgent,
      });
    }

    await clearSessionCookie();
    return NextResponse.json({ status: 200, message: "Logged out successfully" });
  } catch (error) {
    await clearSessionCookie();
    return NextResponse.json({ status: 200, message: "Logged out" });
  }
}
