import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    if (currentUser.role === "student") {
      redirect("/student");
    } else {
      redirect("/admin");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="grid-paper mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ocean-700">EvOLve Secure Access</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950">
            Login to manage research teams and publications.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Faculty admins manage research teams, create student joining links, reset student
            passwords, and keep team project details current. Ritwik acts as the super admin who can update login details for any user.
          </p>
        </section>
        <LoginForm />
      </main>
    </>
  );
}
