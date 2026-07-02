import { SiteHeader } from "@/components/site-header";
import { MembersDirectory } from "@/components/members-directory";
import { getDynamicFaculty, getStudents, getTeams } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [faculty, students, teams] = await Promise.all([
    getDynamicFaculty(),
    getStudents(),
    getTeams(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50 min-h-[calc(100vh-4rem)]">
        <MembersDirectory
          initialFaculty={faculty}
          initialStudents={students}
          initialTeams={teams}
        />
      </main>
    </>
  );
}
