# CareerLoop — Complete Manual
### Installation · Configuration · Usage

CareerLoop is a small, modular **professional social feed** (a LinkedIn‑style
teaching app with original branding). It is a single **Next.js** full‑stack
application: the pages you see in the browser and the API that reads and writes the
database live in the same project. Sign‑in is handled by **Auth.js (NextAuth v5)**,
and the data lives in one **SQLite** file created from a seed script.

This manual covers everything needed to install, configure, run, use, teach with,
and troubleshoot the app.

---

## Contents

1. What you get
2. System requirements
3. Installation (step by step)
4. Running the app (development vs production)
5. The 10 demo accounts
6. A guided tour of every feature
7. Configuration (`.env.local`, secrets, OAuth providers)
8. Resetting the demo data
9. Project structure
10. Database tables
11. API reference
12. Troubleshooting (including “`npm run dev` is slow”)
13. Teaching notes
14. FAQ

---

## 1. What you get

- A working professional feed: posts, likes, comments and reposts.
- **Login** with username + password, a one‑click **Guest** entry, and real
  **GitHub / Google / Microsoft** sign‑in (ready once you add provider keys).
- **My Network** with a request → accept/decline connection flow.
- **Messaging** (one‑to‑one), **Notifications**, **Search** (people + posts).
- A **profile** you can view and edit (name, role, location, university, about,
  skills), with a star “profile level” and two cards of real statistics.
- Friendly **cartoon person avatars** generated from each name (no photos needed).
- 10 fake users, a seeded feed, and a one‑click **Reset demo data**.

Everything runs locally. No external services are required to use the app (OAuth is
optional).

---

## 2. System requirements

| Item | Requirement |
|------|-------------|
| Node.js | **22.5 or newer** (the app uses the built‑in `node:sqlite`). Check with `node -v`. |
| npm | Comes with Node (check with `npm -v`). |
| Operating system | Windows, macOS or Linux. |
| Disk | ~300 MB for `node_modules`. |
| Browser | Any modern browser (Chrome, Edge, Firefox, Safari). |

There is **no separate database to install** and **no native build step** — the
database is a single file managed by Node itself.

> If `node -v` is older than 22.5, install the latest LTS from nodejs.org (or use a
> version manager such as `nvm`).

---

## 3. Installation (step by step)

1. **Unzip** the project, e.g. to a folder called `careerloop`.

2. **Open a terminal in that folder.**
   ```bash
   cd path/to/careerloop
   ```

3. **Install dependencies** (one time):
   ```bash
   npm install
   ```

4. **Create and fill the database** (one time, or whenever you want a fresh start):
   ```bash
   npm run seed
   ```
   This creates `data/careerloop.db` and loads 10 users and a full feed.

5. **Start the app** (see the next section for options):
   ```bash
   npm run dev
   ```

6. Open **http://localhost:3000** and sign in as `alexchen` / `alexchen1234`.

> **Important performance note (especially in a virtual machine):** put the project
> on the machine’s **own local disk**, not on a shared/mapped folder. Running it from
> a VMware/VirtualBox shared folder (paths like `/mnt/hgfs/...` or `/media/sf_...`)
> makes `node_modules` extremely slow. See Troubleshooting §12.

---

## 4. Running the app (development vs production)

The app ships with these npm scripts:

| Command | What it does |
|---------|--------------|
| `npm run dev` | Development server with hot reload, using **Turbopack** (fast). |
| `npm run build` | Compiles an optimised production build (once). |
| `npm run start` | Runs the production build (fastest at runtime). |
| `npm run seed` | (Re)creates and fills the database. |

**Two ways to run:**

- **Development** — `npm run dev`. Best while editing code. The server is ready in a
  few seconds; the *first* time you open a page it is compiled on demand (a few
  seconds), then it is instant.
- **Production** — `npm run build` once, then `npm run start`. Best for class demos:
  it compiles a single time and then responds almost instantly with no per‑page
  compile wait.

Both serve on **http://localhost:3000**.

---

## 5. The 10 demo accounts

Every password is the **username + `1234`**. You can also see this list any time on
the login page by hovering **“Help — all logins”**.

| # | Name | Role | University | Username | Password |
|---|------|------|------------|----------|----------|
| 1 | Alex Chen *(the default “you”)* | Final‑year Software Student | La Trobe University | `alexchen` | `alexchen1234` |
| 2 | Emily Carter | Cloud Engineer | Monash University | `emilycarter` | `emilycarter1234` |
| 3 | Daniel Walker | Data Analyst | The University of Melbourne | `danielwalker` | `danielwalker1234` |
| 4 | Mei Lin | Technical Recruiter | RMIT University | `meilin` | `meilin1234` |
| 5 | Tom Becker | Startup Founder | The University of Sydney | `tombecker` | `tombecker1234` |
| 6 | Grace Mitchell | Project Manager | UNSW Sydney | `gracemitchell` | `gracemitchell1234` |
| 7 | Lucas Bennett | DevOps Engineer | The University of Queensland | `lucasbennett` | `lucasbennett1234` |
| 8 | Hannah Wright | UX Designer | Australian National University | `hannahwright` | `hannahwright1234` |
| 9 | Noah Taylor | Backend Developer | The University of Adelaide | `noahtaylor` | `noahtaylor1234` |
| 10 | Wei Zhang | Cybersecurity Analyst | The University of Western Australia | `weizhang` | `weizhang1234` |

> **Tip:** log in as two different people in two windows (use a private/incognito
> window for the second) to watch a message or a connection request appear on both
> sides.

---

## 6. A guided tour of every feature

### Signing in
The login page offers three ways in:
- **Username + password** — pre‑filled with `alexchen` / `alexchen1234`.
- **Continue as guest** — one click, no setup; signs you in as a shared “Guest User”.
- **Continue with GitHub / Google / Microsoft** — a real redirect to that provider
  (works once you configure keys; see §7).

### Top navigation
A LinkedIn‑style bar: **Home**, **My Network**, **Messaging**, **Notifications**,
and **Me**. The search box is on the left; **Me** opens a menu with **View profile**,
**Reset demo data** and **Log out**.

### Home (the feed)
- Write a post, tag it with an **IT career field** (Software Engineering, Cyber
  Security, Cloud Development, Artificial Intelligence, Data Science, DevOps, UX
  Design, Embedded & Hardware, Graduate Programs, Internships), and choose a
  visibility.
- **Like**, **Comment** (lazy‑loaded), or **Repost** (with an optional note) any
  post. Counts update live.
- Click any author’s name to open their profile.

### Search
Type in the top bar and press Enter to find **people and posts**. A **×** button
clears the field.

### My Network
Four sections:
- **Invitations** — connection requests sent to you, each with the sender’s note;
  **Accept** or **Decline**.
- **Your connections** — **Message** or **Remove** them.
- **Requests sent** — still pending; you can **Cancel**.
- **People you may know** — press **Connect**, add a short note, and **Send request**.
  The person joins your network only after they **Accept**.

### Messaging
An inbox on the left (each person once) and the open one‑to‑one conversation on the
right. Type a message and **Send**.

### Notifications
Activity on your posts and connections: reactions, comments, new connections, and
incoming connection requests.

### Profile (yours)
**Me → View profile** shows your details. Press **Edit profile** to change your name,
role, location, university, about and skills, then **Save** or **Cancel**. Every
sub‑page has a **← Back to feed** link.

### Left sidebar
A snapshot card with a **star profile level**, your **university**, and two cards of
real numbers: **Profile viewers / Post impressions**, and **Posts / Comments made /
Connections**.

### Avatars
Each user gets a deterministic, friendly **cartoon person avatar** built from their
name (light colours only; no photos required).

---

## 7. Configuration

All configuration lives in **`.env.local`** at the project root. The project ships
with `.env.example`; copy it:

```bash
cp .env.example .env.local
```

### 7.1 The signing secret (required)

Auth.js signs session cookies with `AUTH_SECRET`. A development value is included,
but for anything beyond local testing generate your own:

```bash
npx auth secret      # writes AUTH_SECRET into .env.local
# or set it by hand:
# AUTH_SECRET=a-long-random-string
```

### 7.2 Enabling GitHub / Google / Microsoft sign‑in (optional)

Password and guest login always work. The three OAuth buttons are **already wired in
code** — you only need to register an app with each provider and paste its keys into
`.env.local`. No code changes are required.

The login completes and, on the **first** sign‑in, CareerLoop reads the person’s name
from the provider and **creates a CareerLoop account for them automatically**.

Use these exact **callback URLs** during local development:

| Provider | Where to register | Callback URL |
|----------|-------------------|--------------|
| GitHub | github.com → Settings → Developer settings → OAuth Apps → New | `http://localhost:3000/api/auth/callback/github` |
| Google | console.cloud.google.com → APIs & Services → Credentials → OAuth client ID (Web application) | `http://localhost:3000/api/auth/callback/google` |
| Microsoft | entra.microsoft.com → App registrations → New registration (Web) | `http://localhost:3000/api/auth/callback/microsoft-entra-id` |

Then fill in `.env.local`:

```ini
AUTH_SECRET=your-generated-secret

# GitHub
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...

# Google
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Microsoft Entra ID
AUTH_MICROSOFT_ENTRA_ID_ID=...
AUTH_MICROSOFT_ENTRA_ID_SECRET=...
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
```

Restart the server after editing `.env.local`. Notes:
- Only the providers you fill in will sign in successfully; the others return a
  configuration error (expected) — use **Continue as guest** instead.
- For deployment, change `localhost:3000` in each callback URL to your real domain
  and register that URL with the provider.

### 7.3 Where the login logic lives

The entire login module is the single file **`auth.js`** at the project root. It is
short and commented, and is the one place to add or change providers.

---

## 8. Resetting the demo data

Three equivalent ways to restore the original fake dataset:
- In the app: **Me → Reset demo data**.
- On the command line: `npm run seed`.
- Via the API: `POST /api/reset-demo-data`.

The seed creates **10 users, 10 topics, 17 posts, 22 comments, 56 reactions,
3 reposts, 9 connections and 6 messages**.

---

## 9. Project structure

```
careerloop/
├── auth.js                  # the login module (password + guest + OAuth)
├── next.config.js           # node:sqlite external; dev badge hidden
├── package.json             # scripts; "type": "module"
├── .env.example / .env.local
│
├── lib/
│   ├── db/  database.js · schema.sql · seed.js
│   ├── services/            # all SQL, one file per topic
│   │   feed · posts · users · network · messages · notifications · stats
│   ├── auth-helpers.js      # currentUserId()
│   ├── client.js            # the browser's API helper
│   └── time.js
│
├── components/              # Avatar, TopNav, Footer, ProfileSidebar,
│                            # TrendingTopics, PeopleYouMayKnow, PostComposer,
│                            # FeedPost, CommentList
│
└── app/
    ├── layout.js · globals.css · providers.jsx
    ├── login/page.jsx
    ├── api/                 # the backend: one folder per endpoint (route.js)
    └── (app)/               # signed‑in pages, guarded by (app)/layout.jsx
        page.jsx · network · messaging · notifications · search
        profile · profile/[id]
```

**How one click flows:** `page → lib/client.js → /api/... route → service → SQLite`,
then back. For example, Like → `api.react()` → `POST /api/posts/[id]/react` →
`addReaction()` → SQLite → updated count.

---

## 10. Database tables

One SQLite file (`data/careerloop.db`) with eight tables:

| Table | Stores |
|-------|--------|
| `users` | People + login (`username`, `password`), role, university, about, skills. *Passwords are plain text only because this is a local teaching demo — a real app must hash them.* |
| `topics` | The IT‑career fields and their post counts |
| `posts` | A post: author, content, field, visibility, time |
| `comments` | A comment on a post |
| `reactions` | A reaction on a post |
| `reposts` | A repost of a post, with an optional note |
| `connections` | Links two users; `status` is `pending` or `accepted`, plus the request `message` |
| `messages` | A private message from one user to another |

---

## 11. API reference

All routes return JSON. Everything except the auth routes requires a signed‑in
session (the cookie is sent automatically). The acting user is always the signed‑in
user; the client never sends a user id for writes.

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/auth/*` | Sign in/out, session, providers (Auth.js) |
| GET | `/api/bootstrap` | Everything the Home page needs, in one request |
| GET | `/api/feed` | The feed (posts + reposts), newest first |
| POST | `/api/posts` | Create a post |
| GET/POST | `/api/posts/:id/comments` | List / add comments |
| POST | `/api/posts/:id/react` | Add a reaction |
| POST | `/api/posts/:id/repost` | Repost (optional note) |
| GET | `/api/topics` | Trending fields |
| GET/PUT | `/api/profile` | Get / save the signed‑in user |
| GET | `/api/users` | Everyone |
| GET | `/api/users/:id` | One user (+ relationship to you) |
| GET | `/api/search?q=` | Search people and posts |
| GET | `/api/network` | `{ connections, invitations, sent, suggestions }` |
| POST | `/api/connections/:id` | Send a connection request (with message) |
| DELETE | `/api/connections/:id` | Remove a connection / cancel a request |
| POST | `/api/invitations/:id` | Accept or decline a request (`{accept}`) |
| GET | `/api/messages` | My conversations |
| GET/POST | `/api/messages/:id` | Read / send in a conversation |
| GET | `/api/notifications` | Activity on my posts and connections |
| GET | `/api/stats` | Real numbers about me (sidebar) |
| POST | `/api/reset-demo-data` | Restore the original dataset |

---

## 12. Troubleshooting

### `npm run dev` takes minutes to start
Almost always the **environment**, not the code (the same code starts in seconds on a
normal machine). In order of likelihood:

1. **Project is on a VM shared folder.** Running from a VMware/VirtualBox mapped
   folder makes `node_modules` painfully slow.
   - Check: `df -T .` — if the type is `fuse.vmhgfs-fuse` or `vboxsf`, that’s it.
   - Fix: copy the project to the VM’s own disk and reinstall:
     ```bash
     cp -r /mnt/hgfs/.../careerloop ~/careerloop
     cd ~/careerloop && rm -rf node_modules && npm install && npm run dev
     ```
2. **Too little RAM/CPU in the VM.** Compiling is memory‑hungry.
   - Check: `free -h`, `nproc`. Give the VM ≥ 4 GB RAM and ≥ 2 cores; use an SSD.
3. **You’re seeing the first on‑demand page compile**, not startup. `next dev` prints
   `✓ Ready in …` quickly; the first page you open then compiles for a few seconds
   (one time). Compiled pages are instant afterwards.
4. **Want to skip dev compiling entirely?** Use production mode:
   `npm run build` then `npm run start`.
5. Don’t run `npm install` every time — install once, then just `npm run dev`.

### Port 3000 already in use
Another process is on 3000. Stop it, or run on another port:
`PORT=3001 npm run dev` (then open http://localhost:3001).

### “next: not found” / build errors
Dependencies aren’t installed. Run `npm install` in the project folder.

### Node version error
Run `node -v`; it must be ≥ 22.5. Update Node if it’s older.

### A blank page or “Loading profile…” that never finishes
Make sure you ran `npm run seed` at least once, and that you are signed in. (The app
uses only system fonts, so it never waits on an external font server.)

### After GitHub/Google/Microsoft you land on a 404 or error page
Two common causes:
- The provider isn’t configured yet → use **Continue as guest**.
- The callback URL on the provider’s side doesn’t match exactly. It must be
  `http://localhost:3000/api/auth/callback/<provider>` (e.g. `.../callback/github`).

### Start over
`npm run seed` (or **Me → Reset demo data**) restores the original data.

---

## 13. Teaching notes

- **One request, one path.** Every feature follows the same line: a page calls
  `lib/client.js`, which calls an `/api/...` route, which calls a service in
  `lib/services/`, which runs SQL. Tracing a single click end‑to‑end is a great lab
  exercise.
- **All SQL is in `lib/services/`**, separated from the web layer, so students can
  read the data logic on its own.
- **Plain‑text passwords are deliberate and labelled** — a natural lead‑in to why
  real apps hash passwords.
- **`auth.js` is small** and shows password, guest and OAuth side by side.
- **`/api/bootstrap`** demonstrates combining several queries into one response to
  reduce round trips.

---

## 14. FAQ

**Do I need a database server?** No. SQLite is a single file managed by Node.

**Do I need the internet?** No, to use the app. OAuth (optional) needs it.

**Where is my data stored?** In `data/careerloop.db`. Delete it and run
`npm run seed` to reset.

**Can two people use it at once?** Yes — open two browsers/windows and log in as
different demo users.

**Is the guest account shared?** Yes; everyone who clicks *Continue as guest* shares
the “Guest User” account. Configure a real OAuth provider for individual accounts.

**How do I change the demo users or seed content?** Edit `lib/db/seed.js` and run
`npm run seed` again.

---

*Copyright © 2026 Shuo Ding*
