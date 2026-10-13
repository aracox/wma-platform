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

  // Extract ID (must have a real identifier from Facebook)
  let rawId =
    item.id ||
    item.postId ||
    item.post_id ||
    item.entry?.[0]?.id ||
    item.data?.[0]?.id ||
    item.ID;

  let id = rawId ? String(rawId).trim() : "";

  // Extract message / text / story
  let message =
    item.message ||
    item.text ||
    item.content ||
    item.post ||
    item.caption ||
    item.story ||
    item.description ||
    item.name ||
    "";

  // Extract picture / image URL
  let picture =
    item.full_picture ||
    item.picture ||
    item.image ||
    item.imageUrl ||
    item.photo ||
    item.media?.[0]?.src ||
    item.attachments?.data?.[0]?.media?.image?.src ||
    "";

  // Extract permalink
  let permalinkUrl =
    item.permalink_url ||
    item.permalink ||
    item.url ||
    item.link ||
    "";

  // Extract timestamp
  let createdTime =
    item.created_time ||
    item.createdAt ||
    item.date ||
    item.time ||
    item.timestamp ||
    "";

  // ---------------------------------------------------------------------------
  // SMART HEURISTIC FALLBACK:
  // If standard keys were not named properly (e.g. if variables were placed in
  // both Key and Value fields in Make.com), auto-detect values by pattern:
  // ---------------------------------------------------------------------------
  if (!id || (!message && !picture)) {
    const rawEntries: string[] = [];
    for (const [k, v] of Object.entries(item)) {
      if (typeof k === "string" && k.trim()) rawEntries.push(k.trim());
      if (typeof v === "string" && v.trim()) rawEntries.push(v.trim());
    }
    const uniqueValues = Array.from(new Set(rawEntries));

    for (const val of uniqueValues) {
      // 1. Facebook ID pattern: e.g. "123456_789012"
      if (!id && /^\d+_\d+$/.test(val)) {
        id = val;
      }
      // 2. Picture / Image URL: e.g. "https://scontent...fbcdn.net/..."
      else if (
        !picture &&
        (val.startsWith("https://") || val.startsWith("http://")) &&
        (val.includes("fbcdn.net") || /\.(jpg|jpeg|png|webp|gif)/i.test(val))
      ) {
        picture = val;
      }
      // 3. Facebook Permalink URL: e.g. "https://www.facebook.com/.../posts/..."
      else if (
        !permalinkUrl &&
        (val.startsWith("https://") || val.startsWith("http://")) &&
        (val.includes("facebook.com") || val.includes("fb.watch") || val.includes("fb.me"))
      ) {
        permalinkUrl = val;
      }
      // 4. ISO Date / Timestamp: e.g. "2024-03-04T11:37:51.000Z"
      else if (!createdTime && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
        createdTime = val;
      }
      // 5. Message Text: Non-URL text with substantive content
      else if (
        !message &&
        !val.startsWith("http://") &&
        !val.startsWith("https://") &&
        !/^\d+_\d+$/.test(val) &&
        val.length > 2
      ) {
        message = val;
      }
    }
  }

  const cleanMessage = typeof message === "string" ? message.trim() : JSON.stringify(message);
  const cleanPicture = typeof picture === "string" ? picture.trim() : "";
  const cleanPermalink =
    typeof permalinkUrl === "string" && permalinkUrl.trim()
      ? permalinkUrl.trim()
      : id
      ? `https://www.facebook.com/${id}`
      : "https://www.facebook.com/WMA38";
  const cleanCreatedTime =
    typeof createdTime === "string" && createdTime.trim()
      ? createdTime.trim()
      : new Date().toISOString();

  if (!id && !cleanMessage && !cleanPicture) {
    return null;
  }

  return {
    id: id || `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    message: cleanMessage,
    picture: cleanPicture,
    permalinkUrl: cleanPermalink,
    createdTime: cleanCreatedTime,
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
        take: 50,
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
      if (!post || (!post.message && !post.picture)) continue;

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

    if (savedPosts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid post content found in request. Please check field mappings in Make.com.",
          receivedKeys: Object.keys(body || {}),
          receivedBody: body,
        },
        { status: 400 }
      );
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
