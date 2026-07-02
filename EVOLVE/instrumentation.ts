export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Do not run the scheduler during the production build phase or on Vercel
    if (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1") {
      return;
    }
    const { startLocalScheduler } = await import("./lib/scheduler");
    startLocalScheduler();
  }
}
