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
      asOfDate,
      willingToParticipate, notParticipatingReason, hasLandReady,
      informantName, informantPosition, informantAgencyAddress,
      informantPhone, informantMobile, informantFax, informantEmail,
      laoId, laoName, lat, lng, province,
    } = body;

    // Validate the fields (mirrors the official แบบตอบรับ form)
    if (
      !asOfDate || !laoId || !laoName || !province ||
      lat === undefined || lng === undefined ||
      (willingToParticipate !== "yes" && willingToParticipate !== "no") ||
      (willingToParticipate === "no" && !notParticipatingReason) ||
      (hasLandReady !== "yes" && hasLandReady !== "no") ||
      !informantName || !informantPosition || !informantEmail ||
      (!informantPhone && !informantMobile)
    ) {
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
        willingToParticipate,
        notParticipatingReason: willingToParticipate === "no" ? notParticipatingReason : null,
        hasLandReady,
        informantName,
        informantPosition,
        informantAgencyAddress: informantAgencyAddress || null,
        informantPhone: informantPhone || null,
        informantMobile: informantMobile || null,
        informantFax: informantFax || null,
        informantEmail,
        laoId,
        laoName,
        lat,
        lng,
        province,
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
