import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCustomerById, updateCustomer, deactivateCustomer } from "@/services/customer";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 401, message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const customer = await getCustomerById(session, id);

    return NextResponse.json({ status: 200, data: customer });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 401, message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateCustomer(session, id, body);

    return NextResponse.json({ status: 200, message: "Customer updated successfully.", data: updated });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 401, message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const deactivated = await deactivateCustomer(session, id);

    return NextResponse.json({ status: 200, message: "Customer deactivated successfully.", data: deactivated });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}
