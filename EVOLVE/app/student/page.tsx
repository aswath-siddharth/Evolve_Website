import { redirect } from "next/navigation";
import { BookOpen, GraduationCap, ShieldAlert, Sparkles, Users } from "lucide-react";
import { PublicationCard } from "@/components/publication-card";
import { SiteHeader } from "@/components/site-header";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";
import { getDynamicFaculty, getPublications, getStudents, getTeams } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "student") redirect("/admin");

  const [students, teams, publications, faculties] = await Promise.all([
    getStudents(),
    getTeams(),
    getPublications(),
    getDynamicFaculty()
  ]);

  const student = students.find((s) => s.id === currentUser.studentId || s.email.toLowerCase() === currentUser.email.toLowerCase());
  if (!student) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <ShieldAlert className="mx-auto text-amber-500" size={48} />
          <h1 className="mt-4 text-2xl font-black text-slate-950">Student Profile Not Found</h1>
          <p className="mt-2 text-slate-600">Your login exists but we could not find your student record. Please contact your administrator.</p>
        </main>
      </>
    );
  }

  // Load team
  const team = student.teamId ? teams.find((t) => t.id === student.teamId) : null;

  // Load mentors
  const primaryMentor = faculties.find((f) => f.id === student.facultyId);
  const coMentors = (team?.coMentorIds || [])
    .map((id) => faculties.find((f) => f.id === id))
    .filter((f): f is typeof faculties[0] => Boolean(f));

  const mentorIds = [student.facultyId, ...(team?.coMentorIds || [])];

  // Filter mentor publications
  const mentorPublications = publications
    .filter((pub) => mentorIds.includes(pub.facultyId))
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.citations - a.citations;
    });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-md border border-ocean-100 bg-white p-5 shadow-sm mb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ocean-700">
                <Users size={16} />
                Student Workspace
              </p>
              <h1 className="mt-2 text-2xl font-black text-slate-950">
                Welcome, {student.name}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                View your research team assignments, project descriptions, and mentor publications.
              </p>
            </div>
            <LogoutButton />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="grid gap-6 h-fit">
            {/* Team Panel */}
            <div className="rounded-md border border-ocean-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-ocean-50 text-ocean-700">
                  <Users size={19} />
                </span>
                <h2 className="font-black text-slate-950 text-lg">My Research Team</h2>
              </div>

              {team ? (
                <div className="grid gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Name</span>
                    <p className="font-black text-slate-950 text-base">{team.name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Project</span>
                    <p className="font-bold text-ocean-800 text-sm mt-0.5">{team.project}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</span>
                    <p className="text-slate-600 text-sm leading-relaxed mt-0.5">{team.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-500 italic py-2">
                  No research team assigned yet. Contact your mentor to assign you to a team.
                </p>
              )}
            </div>

            {/* Mentors Panel */}
            <div className="rounded-md border border-ocean-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-ocean-50 text-ocean-700">
                  <GraduationCap size={19} />
                </span>
                <h2 className="font-black text-slate-950 text-lg">Research Mentors</h2>
              </div>

              <div className="grid gap-4">
                {/* Primary Mentor */}
                {primaryMentor && (
                  <div className="flex items-start gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                    <div
                      className="grid size-9 shrink-0 place-items-center rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: primaryMentor.accent }}
                    >
                      {primaryMentor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-950 text-sm">{primaryMentor.name}</p>
                      <p className="text-xs text-slate-500">{primaryMentor.email}</p>
                      <span className="inline-flex mt-1.5 rounded-full bg-ocean-100 px-2 py-0.5 text-[10px] font-black text-ocean-800 uppercase tracking-wider">
                        Primary Mentor
                      </span>
                    </div>
                  </div>
                )}

                {/* Co Mentors */}
                {coMentors.map((mentor) => (
                  <div key={mentor.id} className="flex items-start gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                    <div
                      className="grid size-9 shrink-0 place-items-center rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: mentor.accent }}
                    >
                      {mentor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-950 text-sm">{mentor.name}</p>
                      <p className="text-xs text-slate-500">{mentor.email}</p>
                      <span className="inline-flex mt-1.5 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-black text-teal-800 uppercase tracking-wider">
                        Co-Mentor
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Publications Feed */}
          <div className="rounded-md border border-ocean-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-ocean-50 text-ocean-700">
                  <BookOpen size={19} />
                </span>
                <h2 className="font-black text-slate-950 text-lg">Mentor Publications</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-ocean-50 px-2 py-1 text-xs font-bold text-ocean-800">
                <Sparkles size={13} />
                {mentorPublications.length} tracked
              </span>
            </div>

            {mentorPublications.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500 italic py-8 text-center border border-dashed rounded-md">
                No publications found for your mentor(s) yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {mentorPublications.map((publication) => (
                  <PublicationCard key={publication.id} publication={publication} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
