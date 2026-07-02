import { BookOpen, GraduationCap } from "lucide-react";
import type { Faculty, Publication } from "@/lib/types";
import { PublicationCard } from "./publication-card";

export function FacultySection({
  member,
  publications
}: {
  member: Faculty;
  publications: Publication[];
}) {
  return (
    <section className="grid gap-4 rounded-md border border-ocean-100 bg-white/78 p-4 shadow-sm lg:grid-cols-[0.8fr_1.6fr] lg:p-5">
      <div className="flex min-w-0 flex-col justify-between gap-5">
        <div>
          <div
            className="mb-4 grid size-12 place-items-center rounded-md text-white shadow-sm"
            style={{ backgroundColor: member.accent }}
          >
            <GraduationCap size={23} />
          </div>
          <h2 className="text-xl font-bold text-slate-950">{member.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{member.focus}</p>
        </div>
        <div className="grid gap-2 text-sm">
          <a
            href={member.scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-bold text-ocean-700 hover:text-ocean-900"
          >
            <BookOpen size={16} />
            Google Scholar profile
          </a>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {publications
          .slice()
          .sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            if (b.citations !== a.citations) return b.citations - a.citations;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          })
          .slice(0, 4)
          .map((publication) => (
            <PublicationCard key={publication.id} publication={publication} />
          ))}
      </div>
    </section>
  );
}
