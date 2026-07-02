import { NextResponse } from "next/server";
import { acceptInvite } from "@/lib/store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as { name?: string; email?: string; password?: string };

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  try {
    const student = await acceptInvite(id, body.name, body.email, body.password);
    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invite could not be accepted" },
      { status: 400 }
    );
  }
}
