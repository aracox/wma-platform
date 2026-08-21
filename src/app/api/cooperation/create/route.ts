import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session.server";

// POST /api/cooperation/create — add a new cooperation request
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const {
      asOfDate, subject, details, localPlan, expectedOutcome,
      laoId, laoName, lat, lng, province,
    } = body;

    // Validate the fields
    if (!asOfDate || !subject || !details || !expectedOutcome || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const seq = (await prisma.cooperation.count()) + 1;
    const attachments = body.attachments || [];
    // Identity comes from the verified session, never the request body.
    const reportedBy = auth.user.id;

    const cooperation = await prisma.cooperation.create({
      data: {
        id: `c${String(seq).padStart(3, "0")}_${Date.now()}`,
        asOfDate,
        subject,
        details,
        localPlan: localPlan || details,
        expectedOutcome,
        laoId,
        laoName,
        lat,
        lng,
        province: province || "ไม่ระบุ",
        status: "coordination",
        createdAt: new Date().toISOString(),
        reportedBy,
        attachments: JSON.stringify(attachments),
      },
    });

    const { seq: _seq, attachments: _raw, ...rest } = cooperation;
    return NextResponse.json({ ...rest, attachments }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create cooperation request" }, { status: 500 });
  }
}
