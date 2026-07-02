import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createTeam, getTeams, updateTeam } from "@/lib/store";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const teams = await getTeams();
  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.facultyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    id?: string;
    facultyId?: string;
    name?: string;
    project?: string;
    description?: string;
    coMentorIds?: string[];
  };
  const facultyId = currentUser.role === "super_admin" && body.facultyId ? body.facultyId : currentUser.facultyId;

  if (!body.name || !body.project) {
    return NextResponse.json({ error: "Team name and project are required" }, { status: 400 });
  }

  if (body.id) {
    const team = await updateTeam(body.id, {
      name: body.name,
      project: body.project,
      description: body.description || "",
      coMentorIds: body.coMentorIds
    });
    return NextResponse.json({ team });
  }

  const team = await createTeam({
    facultyId,
    name: body.name,
    project: body.project,
    description: body.description || "",
    coMentorIds: body.coMentorIds
  });
  return NextResponse.json({ team });
}
