import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.facebookPost.findMany({
      orderBy: { seq: "desc" },
      take: 50,
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
