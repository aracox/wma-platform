import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface NormalizedFacebookPost {
  id: string;
  message?: string;
  picture?: string;
  permalinkUrl?: string;
  createdTime?: string;
}

export function extractPostData(item: any): NormalizedFacebookPost | null {
  if (!item || typeof item !== "object") return null;

  // Extract ID
  const id =
    String(
      item.id ||
      item.postId ||
      item.post_id ||
      item.entry?.[0]?.id ||
      item.data?.[0]?.id ||
      ""
    ).trim() ||
    `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Extract message / text
  const message =
    item.message ||
    item.text ||
    item.content ||
    item.post ||
    item.caption ||
    item.story ||
    "";

  // Extract picture / image URL
  const picture =
    item.full_picture ||
    item.picture ||
    item.image ||
    item.imageUrl ||
    item.photo ||
    item.media?.[0]?.src ||
    item.attachments?.data?.[0]?.media?.image?.src ||
    "";

  // Extract permalink
  const permalinkUrl =
    item.permalink_url ||
    item.permalink ||
    item.url ||
    item.link ||
    (id && !id.startsWith("fb_") ? `https://www.facebook.com/${id}` : "https://www.facebook.com/WMA38");

  // Extract timestamp
  const createdTime =
    item.created_time ||
    item.createdAt ||
    item.date ||
    item.time ||
    item.timestamp ||
    new Date().toISOString();

  return {
    id,
    message: typeof message === "string" ? message : JSON.stringify(message),
    picture: typeof picture === "string" ? picture : "",
    permalinkUrl: typeof permalinkUrl === "string" ? permalinkUrl : "",
    createdTime: typeof createdTime === "string" ? createdTime : new Date().toISOString(),
  };
}

export async function handleFacebookWebhook(req: NextRequest) {
  try {
    const method = req.method;

    // Support GET for testing & verification
    if (method === "GET") {
      const { searchParams } = new URL(req.url);
      const challenge = searchParams.get("hub.challenge") || searchParams.get("challenge");
      if (challenge) {
        return new NextResponse(challenge, { status: 200 });
      }

      // Return recent posts
      const recentPosts = await prisma.facebookPost.findMany({
        orderBy: { seq: "desc" },
        take: 20,
      });

      return NextResponse.json({
        status: "active",
        message: "WMA Facebook Webhook is active and listening for Make.com requests.",
        totalStored: recentPosts.length,
        recentPosts,
      });
    }

    // Parse incoming JSON or Form Data
    let body: any = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const obj: Record<string, any> = {};
      formData.forEach((val, key) => {
        obj[key] = val;
      });
      body = obj;
    } else {
      try {
        body = await req.json();
      } catch {
        const text = await req.text();
        try {
          body = JSON.parse(text);
        } catch {
          body = { message: text };
        }
      }
    }

    // Collect array of posts
    const incomingItems = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.items)
      ? body.items
      : [body];

    const savedPosts = [];

    for (const raw of incomingItems) {
      const post = extractPostData(raw);
      if (!post || !post.id) continue;

      const saved = await prisma.facebookPost.upsert({
        where: { id: post.id },
        update: {
          message: post.message,
          picture: post.picture,
          permalinkUrl: post.permalinkUrl,
          createdTime: post.createdTime,
          syncedAt: new Date(),
        },
        create: {
          id: post.id,
          message: post.message,
          picture: post.picture,
          permalinkUrl: post.permalinkUrl,
          createdTime: post.createdTime,
        },
      });

      savedPosts.push(saved);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully processed ${savedPosts.length} post(s)`,
        savedCount: savedPosts.length,
        savedPosts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Facebook Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error processing Facebook webhook",
      },
      { status: 500 }
    );
  }
}
