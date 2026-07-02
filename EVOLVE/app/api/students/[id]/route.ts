import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteStudent, getStudents, updateStudent } from "@/lib/store";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.facultyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const students = await getStudents();
  const student = students.find((item) => item.id === id);
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  if (currentUser.role !== "super_admin" && student.facultyId !== currentUser.facultyId) {
    return NextResponse.json({ error: "You can only update students under your faculty team" }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    topic?: string;
    teamId?: string;
    password?: string;
  };
  const updated = await updateStudent(id, body);
  return NextResponse.json({ student: updated });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.facultyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const students = await getStudents();
  const student = students.find((item) => item.id === id);
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  if (currentUser.role !== "super_admin" && student.facultyId !== currentUser.facultyId) {
    return NextResponse.json({ error: "You can only delete students under your faculty team" }, { status: 403 });
  }

  try {
    await deleteStudent(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete student" },
      { status: 500 }
    );
  }
}
