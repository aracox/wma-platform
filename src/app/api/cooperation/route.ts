import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session.server";
import { User } from "@/types";

function serialize({ seq, attachments, ...cooperation }: { seq: number; attachments: string } & Record<string, unknown>) {
  return { ...cooperation, attachments: JSON.parse(attachments) };
}

// Mirrors the visibility rules cooperation/page.tsx applies client-side.
function isCooperationVisibleTo(cooperation: { reportedBy: string | null; laoId: string }, user: User) {
  if (user.role === "admin") return true;
  return (
    cooperation.reportedBy === user.id ||
    cooperation.reportedBy === user.email ||
    (!!user.laoId && cooperation.laoId === user.laoId)
  );
}

// GET /api/cooperation — return cooperation requests visible to the caller
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const cooperations = await prisma.cooperation.findMany({ orderBy: { seq: "asc" } });
    const visible = cooperations.filter((c) => isCooperationVisibleTo(c, auth.user));
    return NextResponse.json(visible.map(serialize));
  } catch {
    return NextResponse.json({ error: "Failed to read cooperations" }, { status: 500 });
  }
}

// PATCH /api/cooperation — update a cooperation request's fields (Admin, or the Official of that request's own LAO)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin", "official"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const {
      id, status, subject, details, localPlan, expectedOutcome,
      willingToParticipate, notParticipatingReason, hasLandReady,
      informantName, informantPosition, informantAgencyAddress,
      informantPhone, informantMobile, informantFax, informantEmail,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (status) {
      const validStatuses = ["coordination", "agreement", "land_acquisition", "construction", "management"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    if (auth.user.role === "official") {
      const existing = await prisma.cooperation.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Cooperation request not found" }, { status: 404 });
      }
      if (existing.laoId !== auth.user.laoId) {
        return NextResponse.json({ error: "คุณไม่มีสิทธิ์ในการดำเนินการนี้ (Forbidden)" }, { status: 403 });
      }
    }

    const data: Prisma.CooperationUpdateInput = { updatedAt: new Date().toISOString() };
    if (status) data.status = status;
    if (subject !== undefined) data.subject = subject;
    if (details !== undefined) data.details = details;
    if (localPlan !== undefined) data.localPlan = localPlan;
    if (expectedOutcome !== undefined) data.expectedOutcome = expectedOutcome;
    if (willingToParticipate !== undefined) data.willingToParticipate = willingToParticipate;
    if (notParticipatingReason !== undefined) data.notParticipatingReason = notParticipatingReason;
    if (hasLandReady !== undefined) data.hasLandReady = hasLandReady;
    if (informantName !== undefined) data.informantName = informantName;
    if (informantPosition !== undefined) data.informantPosition = informantPosition;
    if (informantAgencyAddress !== undefined) data.informantAgencyAddress = informantAgencyAddress;
    if (informantPhone !== undefined) data.informantPhone = informantPhone;
    if (informantMobile !== undefined) data.informantMobile = informantMobile;
    if (informantFax !== undefined) data.informantFax = informantFax;
    if (informantEmail !== undefined) data.informantEmail = informantEmail;

    const cooperation = await prisma.cooperation.update({ where: { id }, data });

    return NextResponse.json(serialize(cooperation));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Cooperation request not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update cooperation request" }, { status: 500 });
  }
}
