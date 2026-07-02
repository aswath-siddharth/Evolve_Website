import { Activity, ArrowRight, BookOpen, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { EvolutionCanvas } from "@/components/evolution-canvas";
import { FacultyList } from "@/components/faculty-list";
import { SiteHeader } from "@/components/site-header";
import { getDynamicFaculty, getPublications } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const faculty = await getDynamicFaculty();
  const publications = await getPublications();
  const totalPublications = publications.length;
  const latestSync = publications
    .map((publication) => publication.updatedAt)
    .sort()
    .at(-1);
  const latestAdminPublications = publications
    .slice()
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      if (b.citations !== a.citations) return b.citations - a.citations;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-ocean-100 bg-white">
          <div className="absolute inset-0">
            <EvolutionCanvas />
          </div>
          <div className="grid-paper relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-md border border-ocean-200 bg-white/86 px-3 py-2 text-sm font-bold text-ocean-800 shadow-sm">
                <Activity size={16} />
                Evolutionary Optimization, Learning and Adaptive Systems
              </p>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                EvOLve research tag publications and team management
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                A live faculty-first portal for Amrita EvOLve: latest Google Scholar publications,
                supervised student teams, and time-bound invite links in one clean research workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#faculty"
                  className="inline-flex items-center gap-2 rounded-md bg-ocean-700 px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-ocean-800"
                >
                  Browse publications
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/members"
                  className="inline-flex items-center gap-2 rounded-md border border-ocean-200 bg-white px-4 py-3 text-sm font-bold text-ocean-800 shadow-sm transition hover:bg-ocean-50"
                >
                  View members
                  <Users size={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-md border border-ocean-200 bg-white px-4 py-3 text-sm font-bold text-ocean-800 shadow-sm transition hover:bg-ocean-50 hover:text-ocean-800"
                >
                  Faculty admin
                  <ShieldCheck size={16} />
                </Link>
              </div>
            </div>
            <div className="grid content-end gap-3">
              {[
                { label: "Faculty profiles", value: faculty.length, icon: Users },
                { label: "Tracked publications", value: totalPublications, icon: Activity },
                { label: "Faculty access", value: "Secure", icon: BookOpen }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md border border-ocean-100 bg-white/88 p-4 shadow-sm backdrop-blur"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{item.value}</p>
                  </div>
                  <span className="grid size-11 place-items-center rounded-md bg-ocean-50 text-ocean-700">
                    <item.icon size={21} />
                  </span>
                </div>
              ))}
              <p className="text-xs font-semibold text-slate-500">
                Last publication refresh: {latestSync ? new Date(latestSync).toLocaleString() : "pending"}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ocean-700">Publications</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Latest publications from EvOLve admins</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Explore the most recent research output across the current faculty admins.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestAdminPublications.map((publication) => {
              const author = faculty.find((member) => member.id === publication.facultyId)?.name || "Faculty";
              const CardContent = (
                <article className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:border-ocean-200 hover:shadow-md hover:-translate-y-0.5">
                  <p className="text-sm font-bold text-slate-950 line-clamp-2">{publication.title}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{author}</p>
                  <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{publication.year}</span>
                    <span>{publication.citations} citations</span>
                  </div>
                </article>
              );

              if (publication.url && publication.url !== "#") {
                return (
                  <a
                    key={publication.id}
                    href={publication.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-full group"
                  >
                    {CardContent}
                  </a>
                );
              }

              return (
                <div key={publication.id} className="block h-full">
                  {CardContent}
                </div>
              );
            })}
          </div>
        </section>

        <section id="faculty" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ocean-700">Faculty</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Latest research output</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Students can scan the current publications across the EvOLve tag, then follow each
              faculty profile for the full Scholar record.
            </p>
          </div>
          <div className="mt-8">
            <FacultyList faculty={faculty} publications={publications} />
          </div>
        </section>
      </main>
    </>
  );
}
