import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/sensors.json");

function readSensors() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeSensors(data: any[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET /api/sensors
export async function GET() {
  try {
    return NextResponse.json(readSensors());
  } catch {
    return NextResponse.json({ error: "Failed to read sensors" }, { status: 500 });
  }
}

// PATCH /api/sensors — update quality level
// Body: { id: string, level: "excellent" | "good" | "fair" | "poor" | "critical" }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, level } = body;

    if (!id || !level) {
      return NextResponse.json({ error: "Missing id or level" }, { status: 400 });
    }

    const validLevels = ["excellent", "good", "fair", "poor", "critical"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const sensors = readSensors();
    const index = sensors.findIndex((s: any) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    sensors[index].level = level;
    sensors[index].timestamp = new Date().toISOString();
    writeSensors(sensors);

    return NextResponse.json(sensors[index]);
  } catch {
    return NextResponse.json({ error: "Failed to update sensor" }, { status: 500 });
  }
}
