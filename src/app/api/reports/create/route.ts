import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "src/data/reports.json");

function readReports() {
  try {
    const file = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(file);
  } catch (err) {
    return [];
  }
}

function writeReports(reports: any[]) {
  fs.writeFileSync(dataFile, JSON.stringify(reports, null, 2), "utf-8");
}

// POST /api/reports/create — add a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      systemInfo, identifiedIssues, laoActivities, communityParticipation, 
      laoId, laoName, lat, lng, province, reportedBy 
    } = body;

    // Validate the 4 fields and coordinates
    if (!systemInfo || !identifiedIssues || !laoActivities || !communityParticipation || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reports = readReports();
    const seq = reports.length + 1;
    const newReport = {
      id: `r${String(seq).padStart(3, "0")}_${Date.now()}`,
      systemInfo,
      identifiedIssues,
      laoActivities,
      communityParticipation,
      laoId,
      laoName,
      lat,
      lng,
      province: province || "ไม่ระบุ",
      status: "pending",
      createdAt: new Date().toISOString(),
      ...(reportedBy && { reportedBy }),
    };

    reports.push(newReport);
    writeReports(reports);

    return NextResponse.json(newReport, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
