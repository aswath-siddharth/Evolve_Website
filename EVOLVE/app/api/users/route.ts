import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUsers, upsertUser } from "@/lib/store";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await getUsers();
  return NextResponse.json({
    users: users.map(({ password, ...user }) => ({ ...user, passwordSet: Boolean(password) }))
  });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "super_admin") {
    return NextResponse.json({ error: "Only the super admin can update login details for all users" }, { status: 403 });
  }

  const body = (await request.json()) as {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    role?: "super_admin" | "faculty" | "student";
    facultyId?: string;
    studentId?: string;
  };

  if (!body.name || !body.email || !body.password || !body.role) {
    return NextResponse.json({ error: "Name, email, password, and role are required" }, { status: 400 });
  }

  const user = await upsertUser({
    id: body.id,
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
    facultyId: body.facultyId,
    studentId: body.studentId
  });

  const { password, ...safeUser } = user;
  return NextResponse.json({ user: { ...safeUser, passwordSet: Boolean(password) } });
}
