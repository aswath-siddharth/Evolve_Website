"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Send, UserPlus } from "lucide-react";
import type { Faculty, Team } from "@/lib/types";

export function JoinRequestForm({
  facultyMember,
  teams
}: {
  facultyMember: Faculty;
  teams: Team[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [password, setPassword] = useState("");
  const [teamId, setTeamId] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submitRequest = () => {
    setMessage("");

    if (!email.toLowerCase().endsWith("amrita.edu")) {
      setMessage("Please use your official college email (ending in amrita.edu)");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/students/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyId: facultyMember.id,
          name,
          email,
          topic,
          password,
          teamId: teamId || undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Failed to submit request");
        return;
      }
      setSuccess(true);
      setMessage(`Join request submitted successfully. Once ${facultyMember.name} approves it, you can log in.`);
    });
  };

  return (
    <div className="rounded-md border border-ocean-100 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span
          className="grid size-11 place-items-center rounded-md text-white"
          style={{ backgroundColor: facultyMember.accent }}
        >
          <UserPlus size={21} />
        </span>
        <div>
          <h1 className="text-2xl font-black text-slate-950">Access Request</h1>
          <p className="mt-1 text-sm text-slate-600">Join {facultyMember.name}'s research team.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Full name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
            placeholder="Your full name"
            disabled={success}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Official college email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
            placeholder="yourname@amrita.edu"
            disabled={success}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Research topic</span>
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
            placeholder="Genetic algorithms, deep learning, etc."
            disabled={success}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Select research team (optional)</span>
          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100 bg-white"
            disabled={success}
          >
            <option value="">Decide later / General join</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.project})
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Choose password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
            placeholder="Create password for student login"
            disabled={success}
          />
        </label>
        <button
          disabled={isPending || !name || !email || !topic || !password || success}
          onClick={submitRequest}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {success ? <CheckCircle2 size={17} /> : <Send size={17} />}
          {success ? "Request Submitted" : "Submit Access Request"}
        </button>
        {message && (
          <p className="rounded-md bg-ocean-50 px-3 py-2 text-sm font-semibold text-ocean-900 border border-ocean-100">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
