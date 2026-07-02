import Link from "next/link";
import { Atom, LogIn, LayoutDashboard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const currentUser = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-ocean-100 bg-white/88 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-ocean-600 text-white shadow-soft">
            <Atom size={21} />
          </span>
          <span>
            <span className="block text-base font-bold tracking-normal text-ocean-900">EvOLve</span>
            <span className="block text-xs font-medium text-slate-500">Amrita Research Tag</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link
            href="/#faculty"
            className="hidden rounded-md px-3 py-2 text-slate-600 transition hover:bg-ocean-50 hover:text-ocean-800 sm:inline-flex"
          >
            Publications
          </Link>
          {currentUser ? (
            <Link
              href={currentUser.role === "student" ? "/student" : "/admin"}
              className="inline-flex items-center gap-2 rounded-md bg-ocean-700 px-3 py-2 text-white shadow-sm transition hover:bg-ocean-800"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md border border-ocean-200 bg-white px-3 py-2 text-ocean-800 shadow-sm transition hover:border-ocean-300 hover:bg-ocean-50"
            >
              <LogIn size={16} />
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

