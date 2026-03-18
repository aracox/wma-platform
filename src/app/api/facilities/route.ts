import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/facilities.json");

function readFacilities() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeFacilities(data: any[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET /api/facilities
export async function GET() {
  try {
    return NextResponse.json(readFacilities());
  } catch {
    return NextResponse.json({ error: "Failed to read facilities" }, { status: 500 });
  }
}

// PATCH /api/facilities — update status
// Body: { id: string, status: "operational" | "non_operational" | "construction" | "cancelled" }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const validStatuses = ["operational", "non_operational", "construction", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const facilities = readFacilities();
    const index = facilities.findIndex((f: any) => f.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    facilities[index].status = status;
    facilities[index].lastUpdated = new Date().toISOString().split("T")[0];
    writeFacilities(facilities);

    return NextResponse.json(facilities[index]);
  } catch {
    return NextResponse.json({ error: "Failed to update facility" }, { status: 500 });
  }
}
