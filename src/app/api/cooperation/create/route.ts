import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAuth } from "@/lib/auth/session.server";

const dataFile = path.join(process.cwd(), "src/data/cooperation.json");

function readCooperations() {
  try {
    const file = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(file);
  } catch (err) {
    return [];
  }
}

function writeCooperations(cooperations: any[]) {
  fs.writeFileSync(dataFile, JSON.stringify(cooperations, null, 2), "utf-8");
}

// POST /api/cooperation/create — add a new cooperation request
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { 
      subject, details, localPlan, expectedOutcome, 
      laoId, laoName, lat, lng, province, reportedBy 
    } = body;

    // Validate the fields
    if (!subject || !details || !expectedOutcome || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cooperations = readCooperations();
    const seq = cooperations.length + 1;
    const newCooperation = {
      id: `c${String(seq).padStart(3, "0")}_${Date.now()}`,
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
      ...(reportedBy && { reportedBy }),
      attachments: body.attachments || [],
    };

    cooperations.push(newCooperation);
    writeCooperations(cooperations);

    return NextResponse.json(newCooperation, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create cooperation request" }, { status: 500 });
  }
}
