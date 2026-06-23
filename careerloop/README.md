# CareerLoop

**Copyright © 2026 Dr Shuo Ding · shuoding@outlook.com — licensed under [AGPL-3.0-or-later](LICENSE).** Free to use and modify. Any modified version, or any deployment that lets users reach it over a network (a hosted or SaaS service), must keep this author copyright notice, remain under the AGPL, and offer the complete corresponding source to those users.

> ⚠️ **Disclaimer — fictitious data, education only.** Every person, name, username, job title, employer, organisation, profile, post, comment, reaction and message in CareerLoop is **fictitious and fabricated for teaching purposes only**. Any resemblance to real people (living or dead) or to real organisations is purely coincidental. Nothing here is real information and must not be relied upon as fact. The software and its data are provided **“as is”, without warranty of any kind**, and the author accepts **no liability** for any use of, or reliance on, this software or its data. See [`LICENSE`](LICENSE) for the full terms.

A modular, beginner-friendly **professional social feed** — built as a single
**Next.js** full-stack app with **Auth.js** login and a **SQLite** database.
Made for teaching: small files, clear names, and a tidy path from a button click
all the way to the database and back.

> A three-column layout with original branding. Post, like,
> comment, repost, connect, message, search — all running locally with fake data.

## Quick start

```bash
npm install                 # install dependencies
cp .env.example .env.local  # create local env (provides AUTH_SECRET for Auth.js)
npm run seed                # create and fill the database (10 users + a full feed)
npm run dev                 # start the dev server
# open http://localhost:3000  ->  log in as  alexchen / alexchen1234
```

Requires **Node.js 22.5 or newer** (it uses the built-in `node:sqlite`, so there
is no database server and no native build step).

## The 10 demo accounts

Every account's password is its username followed by `1234`.

| Name | Username | Password |
|------|----------|----------|
| Alex Chen (you) | `alexchen` | `alexchen1234` |
| Emily Carter | `emilycarter` | `emilycarter1234` |
| Daniel Walker | `danielwalker` | `danielwalker1234` |
| Mei Lin | `meilin` | `meilin1234` |
| Tom Becker | `tombecker` | `tombecker1234` |
| Grace Mitchell | `gracemitchell` | `gracemitchell1234` |
| Lucas Bennett | `lucasbennett` | `lucasbennett1234` |
| Hannah Wright | `hannahwright` | `hannahwright1234` |
| Noah Taylor | `noahtaylor` | `noahtaylor1234` |
| Wei Zhang | `weizhang` | `weizhang1234` |

## Full installation & usage on Ubuntu

This is a complete, beginner-friendly manual for running CareerLoop on a fresh
**Ubuntu 22.04 / 24.04** machine (laptop, VM or EC2). No database server and no
native build step are required — CareerLoop uses Node's built-in `node:sqlite`.

### 1. Requirements

| Requirement | Why | Notes |
|-------------|-----|-------|
| **Node.js 22.5 or newer** | The database layer uses the built-in `node:sqlite` module, added in Node 22.5. | **Node 24 LTS recommended.** On some older 22.x builds Node prints an `node:sqlite is experimental` warning — that is harmless. |
| **npm** | Installs the four dependencies. | Ships with Node. |
| ~100 MB free disk | `node_modules` + the SQLite file under `data/`. | |
| A modern browser | To open the app. | |

CareerLoop's only runtime dependencies are **`next`**, **`react`**, **`react-dom`**
and **`next-auth`** (Auth.js v5). Everything else (HTTP server, SQLite, file
system) comes from Node and Next.js themselves.

### 2. Install Node.js 22.5+ on Ubuntu

**Option A — nvm (recommended, no sudo, easy to switch versions):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# restart the shell, or:  source ~/.bashrc
nvm install 24        # or: nvm install 22
nvm use 24
node -v               # must print v22.5.x or newer
npm -v
```

**Option B — NodeSource apt repository (system-wide):**

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

### 3. Get the code

```bash
unzip careerloop.zip          # or: git clone <your-repo> && cd careerloop
cd careerloop
```

### 4. Install dependencies

```bash
npm install
```

This reads `package.json` and installs `next`, `react`, `react-dom` and
`next-auth` into `node_modules/`.

### 5. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and set a session secret (required by Auth.js):

```bash
npx auth secret            # prints/sets a secure AUTH_SECRET value
# or generate one manually:
openssl rand -base64 33    # paste the output as AUTH_SECRET=...
```

OAuth providers (GitHub / Google / Microsoft) are **optional** — each login
button only appears once its ID/secret pair is filled in. For local teaching you
can ignore them and use the demo accounts below.

### 6. Create and seed the database

```bash
npm run seed
```

This runs `lib/db/seed.js`, which applies `lib/db/schema.sql` and fills the
tables with the demo data (10 users and a full feed). The SQLite file is created
at `data/careerloop.db`. Re-running `npm run seed` rebuilds it from scratch.

### 7. Run it

Development (hot reload):

```bash
npm run dev
# open http://localhost:3000
# log in as:  alexchen  /  alexchen1234
```

Production build and start:

```bash
npm run build
npm start                  # serves on http://localhost:3000
PORT=8080 npm start        # use a different port
```

### 8. Resetting the demo data

Run `npm run seed` again to rebuild the database, or use the in-app reset action
(which calls `POST /api/reset-demo-data`). Every account's password is its
username followed by `1234`.

### 9. Running it on a server (optional)

For a long-running deployment, put a process manager and a reverse proxy in
front of `npm start`:

```bash
# keep it running with PM2
npm install -g pm2
pm2 start "npm start" --name careerloop
pm2 save

# (optional) Nginx reverse proxy: forward port 80 -> 127.0.0.1:3000
```

When CareerLoop is reachable over a network, Auth.js needs to trust the proxy
and know its public URL — set these in `.env.local`:

```text
AUTH_SECRET=<your generated secret>
AUTH_TRUST_HOST=true
AUTH_URL=https://your-domain.example
```

Because CareerLoop is AGPL-3.0-or-later, any such network deployment must keep
the author copyright notice and make the complete source available to its users.

### 10. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` or an experimental-SQLite error | Your Node is older than 22.5, or built without SQLite. Upgrade to Node 22.5+ (Node 24 LTS recommended). |
| Login always fails | The database has not been seeded — run `npm run seed`. Passwords are `username` + `1234`. |
| `MissingSecret` / Auth.js error on start | `AUTH_SECRET` is not set in `.env.local`. Generate one with `npx auth secret`. |
| `EADDRINUSE` (port already in use) | Another process uses port 3000 — run with `PORT=8080 npm start`. |
| Login works locally but not behind a proxy | Set `AUTH_TRUST_HOST=true` and `AUTH_URL` to your public URL. |

## Documentation

- **docs/MANUAL.md** — full walkthrough, the demo accounts, and how to switch on
  GitHub / Google / Microsoft login.
- **docs/ARCHITECTURE.md** — how the code is organised and how a request flows.
- **docs/API.md** — every API endpoint.
- **docs/DATABASE.md** — the eight database tables.

*copyright Shuo Ding 2026*
