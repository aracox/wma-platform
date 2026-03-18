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

// GET /api/reports — return all reports
export async function GET() {
  try {
    const reports = readReports();
    return NextResponse.json(reports);
  } catch (err) {
    return NextResponse.json({ error: "Failed to read reports" }, { status: 500 });
  }
}

// PATCH /api/reports — update a report's status
// Body: { id: string, status: "pending" | "reviewing" | "resolved" }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const validStatuses = ["pending", "reviewing", "resolved"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const reports = readReports();
    const index = reports.findIndex((r: any) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    reports[index].status = status;
    reports[index].updatedAt = new Date().toISOString();
    writeReports(reports);

    return NextResponse.json(reports[index]);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
