import { NextResponse } from "next/server";
import { getPublications } from "@/lib/store";

export async function GET() {
  const publications = await getPublications();
  return NextResponse.json({ publications });
}
