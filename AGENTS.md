# Bond — Agent Build Spec

## What this is
A private, two-person cartoon "affection" app. Two connected users send each
other cute interactions (hug, kiss, boop, etc.); the receiver watches a
first-person animated cartoon scene play out and their avatar reacts. Not a
chat app, not a social network — a tiny shared world for exactly two people.

## Stack (do not deviate without asking)
- Next.js + React + TypeScript + Tailwind
- Framer Motion for animation (Lottie/Rive later, not now)
- Supabase: Auth, Postgres, Realtime, Storage
- Hosting: Vercel

## Non-negotiable engineering rules
1. **No hardcoding per-combination assets.** Avatars are layered
   (character/face/hair/outfit/accessory). Interactions are driven by a data
   config (`id, name, category, icon, animationId, reaction`), not one
   component per interaction.
2. **Server-side trust only.** Never trust a client-supplied `receiverId`.
   Every interaction write must verify: sender is authenticated, sender↔receiver
   have an accepted `connections` row, interaction type is valid.
3. **RLS everywhere.** No table should be readable/writable outside what the
   two connected users are entitled to. No service-role key in client code —
   `NEXT_PUBLIC_*` vars only in the browser bundle.
4. **No fake "done."** If an animation asset isn't built yet, wire it as
   `animationId: "placeholder_hug"` and say so explicitly — don't claim the
   feature is finished. The realtime/db plumbing must not need to change when
   the real asset is dropped in later.
5. **Small files.** No monolith page/component. If a file is doing avatar
   rendering + interaction logic + realtime subscription, split it.
6. **One phase at a time.** Do not start Phase N+1 until Phase N is verified
   working end-to-end. Don't pre-build later-phase UI "while you're in there."

## Folder structure
```
app/
  (auth)/login/  (auth)/register/  onboarding/
  home/  affection/  interaction/  history/  avatar/  room/  settings/
components/
  avatar/  affection/  interaction/  room/  ui/  navigation/
lib/
  supabase/  realtime/  avatar/  interactions/
types/
public/
  avatars/  animations/  sounds/  assets/
```

## Database (paste-ready reference — confirm before running)
Tables: `profiles`, `avatars`, `connections`, `love_codes`, `interactions`,
`gifts`, `rooms`. Each needs PK/FKs, `created_at`, indexes on FK columns, and
RLS policies scoping rows to `auth.uid()` and its connection(s). Full SQL gets
generated in Phase 1 as a migration file, not pasted inline in chat — I'll
write it to `supabase/migrations/` so it's versioned.

## Env vars
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
Service-role key (if ever needed for a server action) stays server-only, never
prefixed `NEXT_PUBLIC_`. `.env.example` ships with the repo, `.env.local` is
gitignored.

## Realtime event shape
```ts
{ senderId, receiverId, interactionType, animationId, timestamp }
```
Validated server-side (Postgres function or edge function) before broadcast —
the client event is a trigger, not a source of truth.

---

## Build order (phase-gated — each phase ends with a manual verify step)

**Phase 1 — Foundation**
Next.js/TS/Tailwind scaffold, Supabase client setup, auth (register/login/
logout/session), protected route wrapper, base DB schema + RLS migration.
*Verify: can register, log in, hit a protected page, get bounced when logged out.*

**Phase 2 — Avatar**
Character select, layered customization UI, save to `avatars` table, render
avatar from stored config anywhere it's needed.
*Verify: create + reload an avatar, layers persist correctly.*

**Phase 3 — Connection**
Love Code generation (`profiles`/`love_codes`), code entry, accept/decline,
`connections` row creation, presence-based online/offline badge.
*Verify: two test accounts connect via code, each sees the other's avatar + status.*

**Phase 4 — Realtime affection (MVP set only)**
Just Hug, Wave, High Five, Thumbs Up. Full send → Realtime → notify → open →
placeholder animation → history-write loop.
*Verify: this is the actual MVP gate — don't move on until it works both directions.*

**Phase 5 — First-person animation framework**
Replace placeholders for Forehead Kiss, Cheek Kiss (L/R), Head Pat, Nose Boop.
Animation engine keyed off `animationId`, not one-off components.

**Phase 6 — History**
Shared timeline view, grouped by day, sender/receiver/type/timestamp.

**Phase 7 — Shared room** (static objects, no multiplayer movement yet)

**Phase 8 — Polish** — more characters/outfits/interactions, sound, particles,
couple themes, gifts.

---

## MVP definition (Phase 4 exit criteria)
Two accounts, each with an avatar, connected via Love Code, can send and
receive a Hug in real time with no page refresh, and it shows up in history.
Nothing beyond this is "MVP."

## Error UX
User-facing copy is always friendly, never raw error codes — e.g. "Oops!
That Love Code doesn't seem to work. 💕" instead of "ERROR 400." Cover:
invalid/expired code, already connected, declined, offline, realtime drop,
missing animation asset, auth/db failures.

## Deploy
GitHub repo → import to Vercel → set env vars → deploy → update Supabase
auth redirect URLs for the prod domain → smoke-test auth, realtime, connection
flow, and one send/receive round trip.

---

## How to drive this with OpenCode
Work one phase at a time, in a fresh scoped request per phase, e.g.:
> "Implement Phase 1 per AGENTS.md. Show the migration SQL and the file list
> before writing code. Stop after and tell me how to verify it."

Don't ask it to "build Bond" in one shot — that's how you get a giant
half-working diff. Keep this file in the repo root so it's loaded as context
automatically each session.
