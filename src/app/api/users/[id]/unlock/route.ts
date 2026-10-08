import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { unlockUserAccount } from "@/services/user";
import { formatApiError } from "@/lib/errors";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userCtx = await getSessionUser();
    const { id } = await params;
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const updated = await unlockUserAccount(id, userCtx, ipAddress);

    return NextResponse.json({
      status: 200,
      message: "User account unlocked successfully",
      data: updated,
    });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
