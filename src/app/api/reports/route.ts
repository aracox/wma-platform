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

// GET /api/reports — return all reports
export async function GET() {
  try {
    const reports = readReports();
    return NextResponse.json(reports);
  } catch (err) {
    return NextResponse.json({ error: "Failed to read reports" }, { status: 500 });
  }
}

// PATCH /api/reports — update a report's fields
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, systemInfo, identifiedIssues, laoActivities, communityParticipation } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const reports = readReports();
    const index = reports.findIndex((r: any) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Update only the provided fields
    if (status) {
      const validStatuses = ["pending", "reviewing", "resolved"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      reports[index].status = status;
    }
    
    if (systemInfo !== undefined) reports[index].systemInfo = systemInfo;
    if (identifiedIssues !== undefined) reports[index].identifiedIssues = identifiedIssues;
    if (laoActivities !== undefined) reports[index].laoActivities = laoActivities;
    if (communityParticipation !== undefined) reports[index].communityParticipation = communityParticipation;

    reports[index].updatedAt = new Date().toISOString();
    writeReports(reports);

    return NextResponse.json(reports[index]);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
