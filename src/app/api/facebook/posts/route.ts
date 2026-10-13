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

    const formattedPosts = posts.map((post) => {
      let images: string[] = [];
      try {
        if (post.images) {
          const parsed = JSON.parse(post.images);
          if (Array.isArray(parsed)) {
            images = parsed.filter((img) => typeof img === "string" && img.trim().length > 0);
          }
        }
      } catch {
        images = [];
      }

      // Fallback: if images is empty but post has picture, use picture
      if (images.length === 0 && post.picture) {
        images = [post.picture];
      }

      return {
        ...post,
        images,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedPosts.length,
      posts: formattedPosts,
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
