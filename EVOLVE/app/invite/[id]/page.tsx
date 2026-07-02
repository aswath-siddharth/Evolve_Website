import { Atom, Clock, KeyRound } from "lucide-react";
import { InviteForm } from "@/components/invite-form";
import { SiteHeader } from "@/components/site-header";

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main className="grid-paper mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1fr] lg:px-8">
        <section>
          <p className="inline-flex items-center gap-2 rounded-md border border-ocean-200 bg-white px-3 py-2 text-sm font-bold text-ocean-800 shadow-sm">
            <Atom size={16} />
            Time-bound student access
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight text-slate-950">
            Secure entry into your assigned research team.
          </h1>
          <div className="mt-6 grid gap-3">
            {[
              { icon: KeyRound, text: "Each link is tied to a faculty team and student email." },
              { icon: Clock, text: "Students set their password while accepting the joining link." }
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 rounded-md bg-white/86 p-3 shadow-sm">
                <span className="grid size-9 place-items-center rounded-md bg-ocean-50 text-ocean-700">
                  <item.icon size={17} />
                </span>
                <p className="text-sm font-semibold text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
        <InviteForm inviteId={id} />
      </main>
    </>
  );
}
