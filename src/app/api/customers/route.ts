import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listCustomers, createCustomer } from "@/services/customer";
import { formatApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 401, message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const params = {
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      ownerId: searchParams.get("ownerId") || undefined,
      city: searchParams.get("city") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    };

    const result = await listCustomers(session, params);
    return NextResponse.json({ status: 200, data: result.items, pagination: result.pagination });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return NextResponse.json(formatted, { status: formatted.status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 401, message: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const customer = await createCustomer(session, body);

    return NextResponse.json(
      { status: 201, message: "Customer created successfully.", data: customer },
      { status: 201 }
    );
  } catch (error: any) {
    const formatted = formatApiError(error);
    const status = formatted.status;
    return NextResponse.json(formatted, { status });
  }
}
