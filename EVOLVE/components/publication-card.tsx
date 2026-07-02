import { ExternalLink, Quote, Sparkles } from "lucide-react";
import type { Publication } from "@/lib/types";

export function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <article className="rounded-md border border-ocean-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ocean-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <Quote className="mt-1 shrink-0 text-ocean-500" size={18} />
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ocean-50 px-2 py-1 text-xs font-bold text-ocean-800">
          <Sparkles size={13} />
          {publication.year}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-slate-950">
        {publication.title}
      </h3>
      <p className="mt-2 line-clamp-1 text-xs font-medium text-slate-500">{publication.authors}</p>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{publication.venue}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-500">{publication.citations} citations</span>
        <a
          href={publication.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-bold text-ocean-700 hover:text-ocean-900"
        >
          View
          <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}
