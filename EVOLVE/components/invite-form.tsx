"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Send, UserPlus } from "lucide-react";

export function InviteForm({ inviteId }: { inviteId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const acceptInvite = () => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/invites/${inviteId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Could not accept invite");
        return;
      }
      setSuccess(true);
      setMessage(`Thank you, ${payload.student.name}. Your join request has been submitted to your faculty mentor for approval.`);
    });
  };

  return (
    <div className="rounded-md border border-ocean-100 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md bg-ocean-700 text-white">
          <UserPlus size={21} />
        </span>
        <div>
          <h1 className="text-2xl font-black text-slate-950">Join EvOLve Research Tag</h1>
          <p className="mt-1 text-sm text-slate-600">Complete your profile and set a password.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Full name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Official email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
            placeholder="yourname@amrita.edu"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Set password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
            placeholder="Create a password"
          />
        </label>
        <button
          disabled={isPending || !name || !email || !password || success || inviteId === "demo"}
          onClick={acceptInvite}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {success ? <CheckCircle2 size={17} /> : <Send size={17} />}
          {success ? "Invite accepted" : inviteId === "demo" ? "Use a generated invite link" : "Accept invite"}
        </button>
        {message && (
          <p className="rounded-md bg-ocean-50 px-3 py-2 text-sm font-semibold text-ocean-900">
            {message}
          </p>
        )}
        {inviteId === "demo" && (
          <p className="rounded-md border border-ocean-100 bg-ocean-50 px-3 py-2 text-sm font-semibold text-ocean-900">
            This is a preview page. Generate a real invite from Faculty Admin to activate submission.
          </p>
        )}
      </div>
    </div>
  );
}
