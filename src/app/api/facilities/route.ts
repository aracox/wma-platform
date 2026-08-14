import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session.server";

function serialize({ seq, ...facility }: { seq: number } & Record<string, unknown>) {
  return facility;
}

// GET /api/facilities
export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({ orderBy: { seq: "asc" } });
    return NextResponse.json(facilities.map(serialize));
  } catch {
    return NextResponse.json({ error: "Failed to read facilities" }, { status: 500 });
  }
}

// PATCH /api/facilities — update status (Admin only)
// Body: { id: string, status: "operational" | "non_operational" | "construction" | "cancelled" | "under_maintenance" | "temporarily_closed" }
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin", "official"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const validStatuses = [
      "operational",
      "non_operational",
      "construction",
      "cancelled",
      "under_maintenance",
      "temporarily_closed",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const facility = await prisma.facility.update({
      where: { id },
      data: { status, lastUpdated: new Date().toISOString().split("T")[0] },
    });

    return NextResponse.json(serialize(facility));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update facility" }, { status: 500 });
  }
}
