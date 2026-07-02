import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createStudentDirectly, getStudents } from "@/lib/store";

export async function GET() {
  const students = await getStudents();
  return NextResponse.json({ students });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.facultyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    topic?: string;
    teamId?: string;
    password?: string;
  };

  if (!body.name || !body.email || !body.password || !body.topic) {
    return NextResponse.json({ error: "Name, email, research topic, and password are required" }, { status: 400 });
  }

  if (!body.email.toLowerCase().endsWith("amrita.edu")) {
    return NextResponse.json({ error: "Must use an official college email (@amrita.edu or @*.amrita.edu)" }, { status: 400 });
  }

  try {
    const student = await createStudentDirectly({
      facultyId: currentUser.facultyId,
      name: body.name,
      email: body.email,
      topic: body.topic,
      teamId: body.teamId,
      password: body.password
    });
    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add student directly" },
      { status: 500 }
    );
  }
}
