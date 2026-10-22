# Regex Trainer

Drill everyday regular expressions until they're automatic. Two modes:

- **Quiz**: 55 multiple-choice questions on tokens (`\d`, `+`, `()`, `\b`, flags…). They come in three shapes: what a token means, which string a pattern matches, and which pattern fits a description.
- **Builder**: 32 challenges. Write one regex that matches every string in the left list and none in the right, with matches highlighted as you type.

Each mode has a menu showing which items you've finished. **Start over** clears your checkmarks and logs how far you got to that mode's reset history.

JavaScript regex flavour, matching browsers, Node and VS Code search.

## Stack

- Next.js 16 (App Router, Cache Components), Tailwind CSS v4, daisyUI 5
- Auth.js v5 with GitHub OAuth and JWT sessions, so there are no auth tables
- Drizzle ORM. Production uses Neon Postgres (Vercel Marketplace); local dev uses embedded [PGlite](https://pglite.dev) in `./.pglite`

## Local development

Requires Node 20.19+ (`.nvmrc` pins 24).

```sh
nvm use
npm install
cp .env.example .env.local   # then set AUTH_SECRET: openssl rand -base64 32
npm run dev
```

With no other env vars set:

- **Database:** PGlite is created and migrated automatically on first request.
- **Auth:** the sign-in page offers **Continue as dev user** instead of GitHub. This fallback is never enabled in production builds.

To test real GitHub sign-in locally, create a second OAuth app (see below) with callback `http://localhost:3000/api/auth/callback/github` and set `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` in `.env.local`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm test` | Unit tests, plus content validation that runs every quiz answer and builder solution against real regexes |
| `npm run lint` | ESLint |
| `npm run build` | Applies DB migrations (Neon only), then `next build` |
| `npm run db:generate` | Generates a new migration after editing `src/db/schema.ts` |

## Deploying to Vercel

1. **Create the project.** Push this repo to GitHub and import it in Vercel.
2. **Add the database.** Go to Project → **Storage** → **Create Database** → **Neon** and connect it to the project. This sets `DATABASE_URL`.
3. **Create a GitHub OAuth app** at <https://github.com/settings/developers> → *New OAuth App*:
   - Homepage URL: `https://<your-domain>`
   - Authorization callback URL: `https://<your-domain>/api/auth/callback/github`
4. **Add env vars** in Project → Settings → Environment Variables:
   - `AUTH_SECRET`: `openssl rand -base64 32`
   - `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`: from the OAuth app
5. **Deploy.** The build command (`npm run build`) runs the migrations against Neon before building.

GitHub OAuth apps allow only one callback URL each. Login therefore works on the production domain and on localhost (with its own OAuth app), but not on Vercel preview deployments.

To pull production env vars locally: `vercel link && vercel env pull .env.local`.

## How it works

- **Content** is typed data in `src/content/` (`quiz.ts`, `builder.ts`, `topics.ts`), not the DB. Each item's stable `id` is what the DB stores, so adding or reordering items is safe. `npm test` fails if any answer key or solution is wrong.
- **Progress** (`src/db/schema.ts`):
  - Each (user, mode) has one active `run`. `completions` rows hang off it.
  - Starting over stamps the run with `ended_at` and its completed/total counts, which become the reset history. A fresh run is then created on next use.
- **Builder grading** (`src/lib/regex.ts`): a string counts as matched only when the regex's actual leftmost match covers the whole string. That's exactly what the highlighting shows, so alternation order matters (`a|ab` doesn't match `ab`), just like a find in your editor.
- **Identity** is `github:<numeric id>` from the JWT (or `dev:local` in the dev fallback). `src/proxy.ts` redirects signed-out visitors to `/signin`, and every server action re-checks the session.
