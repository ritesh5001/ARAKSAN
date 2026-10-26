# araksan.com

Personal website for Araksan Idriss Omar, Independent Consultant | Executive Producer.
Built by NextGen Fusion under agreement NGF-ARAK-2026-01.

Next.js 16 (App Router, Cache Components) · TypeScript (strict) · Tailwind CSS 4 · English and French.

## Run it locally

```bash
npm install
cp .env.example .env.local        # then fill in the admin lines (below)
npm run admin:credentials -- "a long passphrase"   # prints ADMIN_* lines for .env.local
npm run dev                       # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run admin:credentials -- "<password>" [--totp]` | Password hash, session secret and optional two-step secret |
| `npm run brand:wordmark` | Rebuilds the wordmark SVGs in `brand/` and the favicon |

## How it is put together

```
src/
  app/[lang]/          five pages: / (Home), /about, /consulting, /productions, /contact
  app/[lang]/          plus /privacy and /perspectives (hidden until switched on)
  components/sections/ one component per page (Hero + Paths + AboutIntro make up Home)
  app/admin/           site editor (password protected) and its server actions
  app/media/[file]     serves images uploaded through the editor
  app/sitemap.ts, robots.ts, [lang]/opengraph-image.tsx
  components/          header (sticky, highlights the current section), footer, contact form, editor
  content/seed.json    initial content: approved English copy + French drafts
  lib/                 content store, auth, TOTP, mail, rate limiting, i18n
  proxy.ts             locale redirect (/ → /en or /fr) and staging password
public/textures/       abstract textures (paper, horizon, contours, night, stone, bronze)
brand/                 wordmark SVGs (3 variants × 2 colourways) and preview sheet
storage/               runtime data, not in git: content.json, backups/, uploads/
```

**Content.** Every word and image on the site is editable in `/admin`. Content is one JSON
document. It starts from `src/content/seed.json`; the first save in the editor writes
`storage/content.json`, and each later save keeps a timestamped copy in `storage/backups/`
(last 30). Saves are checked against the seed's structure, so a bad save can't break the site.

**Rendering.** Public pages are prerendered. Content is read through a `'use cache'`
function tagged `site-content`; saving in the editor calls `updateTag`, so pages refresh on
the next request with no rebuild.

**Pages.** Five pages per language, as in the agreement: Home, About, Consulting,
Productions and Contact, plus Privacy (and Perspectives once switched on).

**Languages.** `/en/...` and `/fr/...`, with `hreflang` alternates, a language switch in the
header, and a redirect from `/` based on the browser's language (English by default).

**Editor security.** scrypt password hash, signed HTTP-only session cookie (12 h), optional
authenticator-app code (RFC 6238), sign-in rate limit of 5 attempts per 15 minutes,
`noindex` and `no-store` on every `/admin` response.

**Contact form.** Server action with validation, a honeypot field, a minimum fill time and a
limit of 5 messages per hour per IP. Enquiries are emailed through [Resend](https://resend.com) to
`CONTACT_TO_EMAIL` (plain text and HTML, with Reply-To set to the visitor) and nothing is
stored. Without `RESEND_API_KEY` in development, the enquiry is logged instead; in production
the form reports an error rather than pretending to send.

To send from `araksan.com`, add the domain in Resend (Domains → Add) and enter the DNS records
it shows at GoDaddy (DKIM and SPF on a `send.` subdomain, so they don't clash with the mailbox
records). Then set `CONTACT_FROM_EMAIL` to an address on that domain.

## Environments

| | `SITE_ENV` | `STAGING_PASSWORD` | Indexed |
| --- | --- | --- | --- |
| Local | unset | unset | no |
| Staging (her review link) | unset | set | no: password, `noindex` header, `robots.txt` disallows all |
| Production (araksan.com) | `production` | unset | yes |

`SITE_URL` and `SITE_ENV` are read at **build** time; set them before `npm run build`.

## Hosting

The editor writes files, so the host needs a persistent disk for `STORAGE_DIR`. A small Node
host with a volume fits the USD 0–60/year estimate (for example Railway, Render, Fly.io or a
Hostinger VPS) running `npm run build && npm start`. Back up `STORAGE_DIR` with the host's
volume snapshots.

Vercel's file system is read-only, so on Vercel `src/lib/content.ts` (read/write) and the
upload/serve code in `src/app/admin/actions.ts` and `src/app/media/[file]/route.ts` would
need to move to Vercel Blob or a small database. Decide this with the client before
deploying (build documentation, section 8).

## Before launch: open items

The site is built from the approved brief, but these items still need the client:

- **Page names, wordmark and French scope**: confirm "Consulting"/"Productions", pick a
  wordmark variant (`brand/wordmark-preview.png`), and confirm French and the wordmark in writing.
- **French text**: everything in French is a draft translation for her approval.
- **Contact page and privacy notice**: the intro line, form labels, messages, the privacy
  note and `/privacy` are drafts.
- **Portraits**: her three approved photos (26 Oct 2026) are used unaltered, one per page:
  `portrait-green-shirt.jpg` on Home, `portrait-writing.jpg` on About and
  `portrait-writing-blue.jpg` (her alternative writing image) on Consulting. The
  earlier AI-generated portraits are retired to `assets-original/ai-portrait-proposals/`;
  Contact has no photo.
- **Project art**: Beyond the Noise uses a crop of her key art without the baked-in title.
  Numi is shown as two projects at her request: the book (`numi-book.jpg`) and the animation
  (`numi-animation.jpg`). Their short descriptions are drafts for her approval.
- **Textures** are AI-generated abstract backgrounds, which she approved.
- **SEO titles and descriptions** (Search & sharing in the editor) are drafts.
- **Email**: `contact@araksan.com` stays hidden (Settings → Show the email address) until
  the mailbox and SPF/DKIM/DMARC work.
- **Perspectives** stays off until her first essay is approved.

Full checklist: section 12 of the build documentation.
