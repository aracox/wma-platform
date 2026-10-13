import { NextRequest } from "next/server";
import { handleFacebookWebhook } from "@/lib/facebook-webhook";

export async function GET(req: NextRequest) {
  return handleFacebookWebhook(req);
}

export async function POST(req: NextRequest) {
  return handleFacebookWebhook(req);
}
