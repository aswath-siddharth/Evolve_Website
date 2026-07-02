import { NextResponse } from "next/server";
import { syncScholarPublications } from "@/lib/scholar";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");

  if (secret && header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncScholarPublications();
  return NextResponse.json(result);
}
