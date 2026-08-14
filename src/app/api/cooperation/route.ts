import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session.server";

function serialize({ seq, attachments, ...cooperation }: { seq: number; attachments: string } & Record<string, unknown>) {
  return { ...cooperation, attachments: JSON.parse(attachments) };
}

// GET /api/cooperation — return all cooperation requests
export async function GET() {
  try {
    const cooperations = await prisma.cooperation.findMany({ orderBy: { seq: "asc" } });
    return NextResponse.json(cooperations.map(serialize));
  } catch {
    return NextResponse.json({ error: "Failed to read cooperations" }, { status: 500 });
  }
}

// PATCH /api/cooperation — update a cooperation request's fields (Admin & Official only)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin", "official"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { id, status, subject, details, localPlan, expectedOutcome } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (status) {
      const validStatuses = ["coordination", "agreement", "land_acquisition", "construction", "management"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    const data: Prisma.CooperationUpdateInput = { updatedAt: new Date().toISOString() };
    if (status) data.status = status;
    if (subject !== undefined) data.subject = subject;
    if (details !== undefined) data.details = details;
    if (localPlan !== undefined) data.localPlan = localPlan;
    if (expectedOutcome !== undefined) data.expectedOutcome = expectedOutcome;

    const cooperation = await prisma.cooperation.update({ where: { id }, data });

    return NextResponse.json(serialize(cooperation));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Cooperation request not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update cooperation request" }, { status: 500 });
  }
}
