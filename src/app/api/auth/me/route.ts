import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth/session.server";

export async function GET(request: NextRequest) {
  const user = getSessionUserFromRequest(request);
  return NextResponse.json({
    authenticated: !!user,
    user: user || null,
  });
}
