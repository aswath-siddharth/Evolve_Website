# EvOLve Research Tag Portal

Next.js + Tailwind CSS portal for the Amrita EvOLve research tag.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Main Features

- Public homepage with EvOLve faculty and latest tracked publications.
- Faculty admin page at `/admin` for team overview and student invite links.
- Time-limited student invite acceptance at `/invite/[id]`.
- Google Scholar publication sync endpoint at `/api/cron/sync-publications`.
- No automatic Vercel cron schedule is configured by default.

## Publication Sync

Manual sync:

```bash
npm run sync:publications
```

Production cron endpoint:

```text
GET /api/cron/sync-publications
Authorization: Bearer <CRON_SECRET>
```

Google Scholar can rate-limit or block automated scraping. For production, keep the current cached-publication fallback and consider adding a Scholar-compatible data provider if higher reliability is required.
