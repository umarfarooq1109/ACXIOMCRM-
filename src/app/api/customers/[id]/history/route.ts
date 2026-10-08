import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCustomerHistory } from "@/services/customer";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 401, message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const history = await getCustomerHistory(session, id);

    return NextResponse.json({ status: 200, data: history });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
