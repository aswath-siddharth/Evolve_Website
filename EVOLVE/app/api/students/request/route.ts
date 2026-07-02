import { NextResponse } from "next/server";
import { createJoinRequest } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    facultyId: string;
    name: string;
    email: string;
    topic: string;
    teamId?: string;
    password?: string;
  };

  if (!body.facultyId || !body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Name, email, research topic, and password are required" }, { status: 400 });
  }

  if (!body.email.toLowerCase().endsWith("amrita.edu")) {
    return NextResponse.json({ error: "Must use an official college email (@amrita.edu or @*.amrita.edu)" }, { status: 400 });
  }

  try {
    const student = await createJoinRequest(body);
    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit joining request" },
      { status: 500 }
    );
  }
}
