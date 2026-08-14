import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session.server";

// POST /api/reports/create — add a new report
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const {
      systemInfo, identifiedIssues, laoActivities, communityParticipation,
      laoId, laoName, lat, lng, province,
    } = body;

    // Validate mandatory fields and coordinates
    if (!systemInfo || !identifiedIssues || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const seq = (await prisma.report.count()) + 1;
    const attachments = body.attachments || [];
    // Identity fields come from the verified session, never the request body -
    // otherwise a caller could file a report while claiming to be someone else.
    const reportedBy = auth.user.email || auth.user.id || "ไม่ระบุ";
    const reportedByEmail = auth.user.email;

    const report = await prisma.report.create({
      data: {
        id: `r${String(seq).padStart(3, "0")}_${Date.now()}`,
        systemInfo,
        identifiedIssues,
        laoActivities: laoActivities || "-",
        communityParticipation: communityParticipation || "-",
        laoId,
        laoName,
        lat,
        lng,
        province: province || "ไม่ระบุ",
        status: "pending",
        createdAt: new Date().toISOString(),
        reportedBy,
        reportedByEmail,
        attachments: JSON.stringify(attachments),
      },
    });

    const { seq: _seq, attachments: _raw, ...rest } = report;
    return NextResponse.json({ ...rest, attachments }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
