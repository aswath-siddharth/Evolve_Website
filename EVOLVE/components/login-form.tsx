"use client";

import { useState, useTransition } from "react";
import { Atom, Eye, EyeOff, LogIn } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("m_ritwik@cb.amrita.edu");
  const [password, setPassword] = useState("Amrita@123");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const login = () => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Login failed");
        return;
      }
      if (payload.user.role === "student") {
        window.location.href = "/student";
      } else {
        window.location.href = "/admin";
      }
    });
  };

  return (
    <div className="rounded-md border border-ocean-100 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-ocean-700 text-white">
          <Atom size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-black text-slate-950">Faculty Login</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">EvOLve admin access</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Email ID</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Password</span>
          <div className="flex h-11 overflow-hidden rounded-md border border-slate-200 focus-within:border-ocean-400 focus-within:ring-4 focus-within:ring-ocean-100">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? "text" : "password"}
              className="min-w-0 flex-1 px-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="grid w-11 place-items-center text-slate-500 transition hover:bg-ocean-50 hover:text-ocean-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        <button
          disabled={isPending || !email || !password}
          onClick={login}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-ocean-800 disabled:opacity-55"
        >
          <LogIn size={17} />
          Login
        </button>
        {message && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{message}</p>
        )}
      </div>
    </div>
  );
}
