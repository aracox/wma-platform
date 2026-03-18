import { NextRequest, NextResponse } from "next/server";
import initialData from "@/data/reports.json";

// For reports/create, we'll import and update the imported array directly to simulate a backend store
// (Note: in Vercel this clears on cold start, but is fine for demos)
let reportsCache: any[] = [...initialData];

function readReports() {
  return reportsCache;
}

function writeReports(reports: any[]) {
  reportsCache = reports;
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
