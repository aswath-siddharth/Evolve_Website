import { syncScholarPublications } from "./scholar";

export function startLocalScheduler() {
  // Prevent duplicate schedulers across Next.js HMR/Fast Refresh reloads
  if (global.hasOwnProperty("__localSchedulerStarted__")) {
    return;
  }
  (global as any).__localSchedulerStarted__ = true;

  console.log("[Scheduler] Local background scheduler initialized. Syncing Google Scholar every 24 hours.");

  // Trigger an initial sync 5 seconds after startup to populate data without blocking startup
  setTimeout(() => {
    console.log("[Scheduler] Running initial publication sync...");
    syncScholarPublications()
      .then((res) => {
        console.log("[Scheduler] Initial sync completed successfully:", res);
      })
      .catch((err) => {
        console.error("[Scheduler] Initial sync failed:", err);
      });
  }, 5000);

  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  setInterval(async () => {
    console.log("[Scheduler] Running periodic 24-hour publication sync...");
    try {
      const res = await syncScholarPublications();
      console.log("[Scheduler] Periodic sync completed successfully:", res);
    } catch (err) {
      console.error("[Scheduler] Periodic sync failed:", err);
    }
  }, TWENTY_FOUR_HOURS_MS);
}
