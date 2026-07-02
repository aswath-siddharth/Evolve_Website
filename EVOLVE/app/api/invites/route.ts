import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInvite, getInvites } from "@/lib/store";

export async function GET() {
  const invites = await getInvites();
  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.facultyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    facultyId?: string;
    teamId?: string;
    email?: string;
    hoursValid?: number;
  };

  const facultyId = currentUser.role === "super_admin" && body.facultyId ? body.facultyId : currentUser.facultyId;

  if (!facultyId || !body.email) {
    return NextResponse.json({ error: "Faculty and student email are required" }, { status: 400 });
  }

  const invite = await createInvite(facultyId, body.email, body.hoursValid || 48, body.teamId);
  return NextResponse.json({ invite });
}
