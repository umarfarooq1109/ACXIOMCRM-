import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { reactivateCustomer } from "@/services/customer";
import { formatApiError } from "@/lib/errors";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 401, message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const reactivated = await reactivateCustomer(session, id);

    return NextResponse.json({ status: 200, message: "Customer reactivated successfully.", data: reactivated });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
