import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session.server";
import { User } from "@/types";

function serialize({ seq, attachments, ...report }: { seq: number; attachments: string } & Record<string, unknown>) {
  return { ...report, attachments: JSON.parse(attachments) };
}

// Mirrors the visibility rules report/page.tsx applies client-side: admins see
// everything, public users see only their own submissions, officials see only
// their own LAO's reports. Enforced here too since the client-side filter is
// cosmetic on its own - the API must not hand out every citizen's report to
// anyone who asks.
function isReportVisibleTo(report: { reportedByEmail: string | null; reportedBy: string | null; laoId: string }, user: User) {
  if (user.role === "admin") return true;
  if (user.role === "official") return !!user.laoId && report.laoId === user.laoId;
  const emailLower = user.email?.toLowerCase();
  if (!emailLower) return false;
  return report.reportedByEmail?.toLowerCase() === emailLower || report.reportedBy?.toLowerCase() === emailLower;
}

// GET /api/reports — return reports visible to the caller
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const reports = await prisma.report.findMany({ orderBy: { seq: "asc" } });
    const visible = reports.filter((r) => isReportVisibleTo(r, auth.user));
    return NextResponse.json(visible.map(serialize));
  } catch {
    return NextResponse.json({ error: "Failed to read reports" }, { status: 500 });
  }
}

// PATCH /api/reports — update a report's fields (Admin, or the Official of that report's own LAO)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin", "official"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { id, status, systemInfo, identifiedIssues, laoActivities, communityParticipation } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (status) {
      const validStatuses = ["pending", "reviewing", "resolved"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    if (auth.user.role === "official") {
      const existing = await prisma.report.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      if (existing.laoId !== auth.user.laoId) {
        return NextResponse.json({ error: "คุณไม่มีสิทธิ์ในการดำเนินการนี้ (Forbidden)" }, { status: 403 });
      }
    }

    const data: Prisma.ReportUpdateInput = { updatedAt: new Date().toISOString() };
    if (status) data.status = status;
    if (systemInfo !== undefined) data.systemInfo = systemInfo;
    if (identifiedIssues !== undefined) data.identifiedIssues = identifiedIssues;
    if (laoActivities !== undefined) data.laoActivities = laoActivities;
    if (communityParticipation !== undefined) data.communityParticipation = communityParticipation;

    const report = await prisma.report.update({ where: { id }, data });

    return NextResponse.json(serialize(report));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
