import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session.server";

function serialize({ seq, attachments, ...report }: { seq: number; attachments: string } & Record<string, unknown>) {
  return { ...report, attachments: JSON.parse(attachments) };
}

// GET /api/reports — return all reports
export async function GET() {
  try {
    const reports = await prisma.report.findMany({ orderBy: { seq: "asc" } });
    return NextResponse.json(reports.map(serialize));
  } catch {
    return NextResponse.json({ error: "Failed to read reports" }, { status: 500 });
  }
}

// PATCH /api/reports — update a report's fields (Admin & Official only)
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
