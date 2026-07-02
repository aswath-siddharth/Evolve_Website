import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { JoinRequestForm } from "@/components/join-request-form";
import { SiteHeader } from "@/components/site-header";
import { getDynamicFaculty, getTeams } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = await params;
  const faculties = await getDynamicFaculty();
  const facultyMember = faculties.find((f) => f.id === facultyId);

  if (!facultyMember) {
    notFound();
  }

  const allTeams = await getTeams();
  const facultyTeams = allTeams.filter((team) => team.facultyId === facultyId);

  return (
    <>
      <SiteHeader />
      <main className="grid-paper mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1fr] lg:px-8">
        <section>
          <div
            className="mb-5 grid size-14 place-items-center rounded-md text-white shadow-sm"
            style={{ backgroundColor: facultyMember.accent }}
          >
            <GraduationCap size={28} />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: facultyMember.accent }}>
            Faculty Group Signup
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950">
            Request to join {facultyMember.name}'s research team.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Research focus: <span className="font-semibold text-slate-900">{facultyMember.focus}</span>.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Students can request credentials to login and view mentor publications, track project progress,
            and view assigned teams. Request requires direct approval from the faculty mentor.
          </p>
        </section>
        <JoinRequestForm facultyMember={facultyMember} teams={facultyTeams} />
      </main>
    </>
  );
}
