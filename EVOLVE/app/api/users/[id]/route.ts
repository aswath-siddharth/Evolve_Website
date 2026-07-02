import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDynamicFaculty, getStudents, getUsers, saveDynamicFaculty, saveStudents, saveUsers, updateUserAndEntity } from "@/lib/store";
import type { UserRole } from "@/lib/types";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "super_admin") {
    return NextResponse.json({ error: "Only the super admin can update login details" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    facultyId?: string;
    studentId?: string;
    status?: "active" | "invited";
    scholarUrl?: string;
    scholarUser?: string;
    focus?: string;
    accent?: string;
    topic?: string;
    teamId?: string;
  };

  try {
    const updated = await updateUserAndEntity(id, body);
    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user login" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "super_admin") {
    return NextResponse.json({ error: "Only the super admin can delete user logins" }, { status: 403 });
  }

  const { id } = await context.params;
  const users = await getUsers();
  const user = users.find((item) => item.id === id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const filteredUsers = users.filter((u) => u.id !== id);
    await saveUsers(filteredUsers);

    if (user.role === "student" && user.studentId) {
      const students = await getStudents();
      await saveStudents(students.filter((s) => s.id !== user.studentId));
    } else if ((user.role === "faculty" || user.role === "super_admin") && user.facultyId) {
      const faculties = await getDynamicFaculty();
      await saveDynamicFaculty(faculties.filter((f) => f.id !== user.facultyId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
