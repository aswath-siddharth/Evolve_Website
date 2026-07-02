import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { approveStudentRequest, getStudents } from "@/lib/store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.facultyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const students = await getStudents();
  const student = students.find((item) => item.id === id);
  if (!student) {
    return NextResponse.json({ error: "Student request not found" }, { status: 404 });
  }

  if (currentUser.role !== "super_admin" && student.facultyId !== currentUser.facultyId) {
    return NextResponse.json({ error: "You can only approve students under your faculty team" }, { status: 403 });
  }

  try {
    const updated = await approveStudentRequest(id);
    return NextResponse.json({ student: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve student" },
      { status: 500 }
    );
  }
}
