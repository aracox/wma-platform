import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/reports.json");

function readReports() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeReports(reports: any[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(reports, null, 2), "utf-8");
}

// POST /api/reports/create — add a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, category, description, lat, lng, province, facilityId, sensorId, reportedBy, facilityName, sensorName } = body;

    if (!description || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reports = readReports();
    const seq = reports.length + 1;
    const newReport = {
      id: `r${String(seq).padStart(3, "0")}_${Date.now()}`,
      type: type || "community",
      category: category || "other",
      description,
      lat,
      lng,
      province: province || "ไม่ระบุ",
      status: "pending",
      createdAt: new Date().toISOString(),
      ...(facilityId && { facilityId }),
      ...(sensorId && { sensorId }),
      ...(reportedBy && { reportedBy }),
      ...(facilityName && { facilityName }),
      ...(sensorName && { sensorName }),
    };

    reports.push(newReport);
    writeReports(reports);

    return NextResponse.json(newReport, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
