import { cookies } from "next/headers";
import { getUserById } from "./store";

export const sessionCookieName = "evolve_user";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return getUserById(cookieStore.get(sessionCookieName)?.value);
}

export function canManageFaculty(userFacultyId: string | undefined, targetFacultyId: string) {
  return userFacultyId === targetFacultyId;
}
