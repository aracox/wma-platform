import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session.server";

function serialize({ seq, ...sensor }: { seq: number } & Record<string, unknown>) {
  return sensor;
}

// GET /api/sensors
export async function GET() {
  try {
    const sensors = await prisma.sensor.findMany({ orderBy: { seq: "asc" } });
    return NextResponse.json(sensors.map(serialize));
  } catch {
    return NextResponse.json({ error: "Failed to read sensors" }, { status: 500 });
  }
}

// PATCH /api/sensors — update quality level (Admin & Official only)
// Body: { id: string, level: "excellent" | "good" | "fair" | "poor" | "critical" }
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin", "official"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { id, level } = body;

    if (!id || !level) {
      return NextResponse.json({ error: "Missing id or level" }, { status: 400 });
    }

    const validLevels = ["excellent", "good", "fair", "poor", "critical"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    if (auth.user.role === "official") {
      const existing = await prisma.sensor.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
      }
      if (existing.province !== auth.user.province) {
        return NextResponse.json({ error: "คุณไม่มีสิทธิ์ในการดำเนินการนี้ (Forbidden)" }, { status: 403 });
      }
    }

    const sensor = await prisma.sensor.update({
      where: { id },
      data: { level, timestamp: new Date().toISOString() },
    });

    return NextResponse.json(serialize(sensor));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update sensor" }, { status: 500 });
  }
}
