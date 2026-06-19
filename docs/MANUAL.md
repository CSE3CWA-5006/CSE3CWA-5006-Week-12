# CareerLoop — User & Teaching Manual

## 1. What it is

CareerLoop is a small professional social network you run on your own computer.
It is one **Next.js** application:

- the **pages** you see in the browser, and
- the **API** that reads and writes the database,

live in the same project. Logging in is handled by **Auth.js (NextAuth)**, and the
data lives in a single **SQLite** file at `data/careerloop.db`.

## 2. Running it

You need **Node.js 22.5+**.

```bash
npm install      # 1. install dependencies
npm run seed     # 2. build the database and fill it with demo data
npm run dev      # 3. start at http://localhost:3000
```

The first screen is the **login page**. It is pre-filled with the main demo
account so you can sign straight in:

- **Username:** `alexchen`
- **Password:** `alexchen1234`

To start over at any time, open the **Me** menu (top right) and choose
**Reset demo data**, or run `npm run seed` again.

## 3. The 10 demo accounts

You can log in as any of these. Every password is the username + `1234`.

| # | Name | Role | Username | Password |
|---|------|------|----------|----------|
| 1 | Alex Chen (the default "you") | Final-year Software Student | `alexchen` | `alexchen1234` |
| 2 | Emily Carter | Cloud Engineer | `emilycarter` | `emilycarter1234` |
| 3 | Daniel Walker | Data Analyst | `danielwalker` | `danielwalker1234` |
| 4 | Mei Lin | Technical Recruiter | `meilin` | `meilin1234` |
| 5 | Tom Becker | Startup Founder | `tombecker` | `tombecker1234` |
| 6 | Grace Mitchell | Project Manager | `gracemitchell` | `gracemitchell1234` |
| 7 | Lucas Bennett | DevOps Engineer | `lucasbennett` | `lucasbennett1234` |
| 8 | Hannah Wright | UX Designer | `hannahwright` | `hannahwright1234` |
| 9 | Noah Taylor | Backend Developer | `noahtaylor` | `noahtaylor1234` |
| 10 | Wei Zhang | Cybersecurity Analyst | `weizhang` | `weizhang1234` |

> Log in as two different people in two browser windows (use a private/incognito
> window for the second) to watch a message or a connection appear on both sides.

## 4. A tour of the features

- **Home** — your feed. Write a post and tag it with a real **IT career field**
  (Software Engineering, Cyber Security, Cloud Development, Artificial Intelligence,
  Data Science, DevOps, UX Design, Embedded & Hardware, Graduate Programs,
  Internships), then **Like**, **Comment** or **Repost** anything. Each person has a
  colourful **cartoon avatar** drawn from their name (no photos needed).
- **Search** (top bar) — type a word and press Enter to find **people and posts**.
- **My Network** — four sections: **Invitations** (requests sent to you, each with
  the sender's note — **Accept** or **Decline**), **Your connections**, **Requests
  sent** (still pending — you can Cancel), and **People you may know**. Pressing
  **Connect** lets you add a short note and sends a *request*; the other person only
  joins your network once they **Accept** it.
- **Messaging** — pick a conversation on the left and send a message on the right.
- **Notifications** — likes, comments and new connections on your activity.
- **Me → View profile** — see your profile, then **Edit** your name, role,
  location, about and skills. Use **Save** to keep changes or **Cancel** to discard
  them, and **← Back to feed** (top of every sub-page) to close it.
- **Me → Log out** — returns you to the login screen.

## 5. Universal login (GitHub / Google / Microsoft) — optional

Password login always works. The login page **always shows** Continue-with-GitHub,
-Google and -Microsoft buttons, and each one starts a **real redirect** to that
provider's sign-in page. They are fully wired in code — the moment you register an
app on the provider's side and add its keys to `.env.local`, the button completes a
real login. (Until then it returns a configuration error, which is expected.)

**Just want to get straight in?** Use the **Continue as guest** button on the login
page. It needs no setup at all — it signs you in as a shared "Guest User" account and
takes you to the feed. This is the easiest way in if an OAuth provider is not
configured yet (or if a provider redirect ever lands on an error page). When you do
configure a provider, make sure its callback URL is exactly
`http://localhost:3000/api/auth/callback/<provider>` (e.g. `.../callback/github`).

The end user never registers on CareerLoop: the **first** time someone signs in with
a provider, CareerLoop reads their name from the provider and **creates a CareerLoop
account** for them automatically, so they can post, connect and message like anyone
else.

### Steps

1. Copy `.env.example` to `.env.local`.
2. Set a signing secret (any long random string):
   ```bash
   npx auth secret      # writes AUTH_SECRET for you, or set it by hand
   ```
3. Register an app with the provider(s) you want and copy the keys in. Use these
   **callback URLs** (for local development):

   | Provider | Where to register | Callback URL |
   |----------|-------------------|--------------|
   | GitHub | github.com → Settings → Developer settings → OAuth Apps | `http://localhost:3000/api/auth/callback/github` |
   | Google | console.cloud.google.com → Credentials → OAuth client ID (Web) | `http://localhost:3000/api/auth/callback/google` |
   | Microsoft | entra.microsoft.com → App registrations → New | `http://localhost:3000/api/auth/callback/microsoft-entra-id` |

4. Put the values in `.env.local`:
   ```
   AUTH_GITHUB_ID=...            AUTH_GITHUB_SECRET=...
   AUTH_GOOGLE_ID=...            AUTH_GOOGLE_SECRET=...
   AUTH_MICROSOFT_ENTRA_ID_ID=...
   AUTH_MICROSOFT_ENTRA_ID_SECRET=...
   AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
   ```
5. Restart the dev server. The matching buttons now appear on the login page.

The whole login module lives in **`auth.js`** — it is short and commented, and is
the single place to add or change providers.

*copyright Shuo Ding 2026*
