import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getDynamicFaculty, getInvites, getPublications, getStudents, getTeams, getUsers } from "@/lib/store";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const [invites, students, teams, users, publications, dynamicFaculty] = await Promise.all([
    getInvites(),
    getStudents(),
    getTeams(),
    getUsers(),
    getPublications(),
    getDynamicFaculty()
  ]);
  const { password, ...safeCurrentUser } = currentUser;
  const safeUsers = users.map(({ password: userPassword, ...user }) => ({
    ...user,
    passwordSet: Boolean(userPassword)
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdminDashboard
          currentUser={safeCurrentUser}
          faculty={dynamicFaculty}
          initialInvites={invites}
          initialStudents={students}
          initialTeams={teams}
          initialUsers={safeUsers}
          publications={publications}
        />
      </main>
    </>
  );
}
