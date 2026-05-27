import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

// GET /api/cooperation — return all cooperation requests
export async function GET() {
  try {
    const cooperations = readCooperations();
    return NextResponse.json(cooperations);
  } catch (err) {
    return NextResponse.json({ error: "Failed to read cooperations" }, { status: 500 });
  }
}

// PATCH /api/cooperation — update a cooperation request's fields
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, subject, details, localPlan, expectedOutcome } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const cooperations = readCooperations();
    const index = cooperations.findIndex((c: any) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Cooperation request not found" }, { status: 404 });
    }

    // Update only the provided fields
    if (status) {
      const validStatuses = ["pending", "reviewing", "resolved"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      cooperations[index].status = status;
    }
    
    if (subject !== undefined) cooperations[index].subject = subject;
    if (details !== undefined) cooperations[index].details = details;
    if (localPlan !== undefined) cooperations[index].localPlan = localPlan;
    if (expectedOutcome !== undefined) cooperations[index].expectedOutcome = expectedOutcome;

    cooperations[index].updatedAt = new Date().toISOString();
    writeCooperations(cooperations);

    return NextResponse.json(cooperations[index]);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update cooperation request" }, { status: 500 });
  }
}
