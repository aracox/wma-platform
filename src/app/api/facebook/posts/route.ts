import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 9;

    const posts = await prisma.facebookPost.findMany({
      orderBy: { seq: "desc" },
      take: isNaN(limit) ? 9 : limit,
    });

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error: any) {
    console.error("Error fetching facebook posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch Facebook posts",
        posts: [],
      },
      { status: 500 }
    );
  }
}
