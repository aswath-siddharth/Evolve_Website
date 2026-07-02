export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Do not run the scheduler during the production build phase
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return;
    }
    const { startLocalScheduler } = await import("./lib/scheduler");
    startLocalScheduler();
  }
}
