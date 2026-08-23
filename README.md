# Slab Ledger

A personal ledger for a sports card collection: log what you own, record
market prices, and watch cost basis versus value move over time.

This is **phase 1** of the project — a manual-entry web app with a real
Postgres schema and portfolio dashboard, ahead of the phase 2 automated
eBay pricing pipeline. See the [design plan](#design-plan) below for the
full roadmap.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, React 19)
- [Prisma 7](https://www.prisma.io) + PostgreSQL, via the `@prisma/adapter-pg` driver adapter
- [Auth.js](https://authjs.dev) (`next-auth@5`) — email/password, JWT sessions
- Tailwind CSS v4, with a small custom design-system layer (`src/components/ui`)

## Getting started

1. **Postgres.** Point `DATABASE_URL` in `.env` at a running Postgres
   instance (see `.env.example`). Locally:

   ```bash
   createdb slab_ledger
   ```

2. **Environment.** Copy `.env.example` to `.env` and fill in
   `DATABASE_URL` and `AUTH_SECRET` (generate one with `npx auth secret`).
   `ANTHROPIC_API_KEY` is optional — only the "Compare with AI" listing-photo
   check on a card's page needs it; everything else works without it.

3. **Install and migrate:**

   ```bash
   npm install
   npx prisma migrate dev
   ```

4. **Run it:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), register an
   account, and add your first card.

## Data model

Four entities, described in full in the design plan: `Card` (catalog
entry), `Holding` (a copy you own), `PriceSnapshot` (a market observation
for a card + grade), and `PortfolioSnapshot` (a dated rollup of the whole
collection). See `prisma/schema.prisma` for the exact shape.

## What's here vs. what's next

Phase 1 (this repo, today):

- Auth, and full CRUD for Card and Holding
- Manual price logging per card + grade
- A live-computed portfolio dashboard (cost basis, market value, gain,
  return) plus an on-demand "record a snapshot" button that builds a
  value-over-time chart
- Optional visual receipts on a manually-logged price (listing URL + photo,
  hotlinked, never re-hosted) and an on-demand "Compare with AI" check —
  paste a listing photo and Claude judges whether it plausibly matches the
  card's declared attributes. Needs `ANTHROPIC_API_KEY`; independent of the
  eBay integration below.

Phase 2 (not built yet): a scheduled worker that pulls eBay sold comps,
matches them to a card + grade, confidence-scores the match (now including
a visual-match signal from the same AI comparison), and writes
`PriceSnapshot` rows automatically — with a manual review queue for
low-confidence matches. Phase 3 is a native mobile app on the same API.

## Design plan

The full product plan — architecture, pricing pipeline, roadmap, and known
risks (notably: eBay's sold-price API is application-gated) — was written
up as a standalone design document before this code was scaffolded.
