# Architecture

CareerLoop is **one Next.js app** (App Router). The browser pages and the API are
in the same project, which keeps the code small and easy to follow.

```
careerloop/
├── auth.js                  # the universal login module (Auth.js): password + OAuth
├── next.config.js
├── package.json             # "type": "module"  (everything uses import/export)
│
├── lib/
│   ├── db/
│   │   ├── database.js      # opens the SQLite database (node:sqlite)
│   │   ├── schema.sql       # the 8 tables
│   │   └── seed.js          # fills the database with demo data  (npm run seed)
│   ├── services/            # all the SQL lives here, one file per topic
│   │   ├── feed.service.js
│   │   ├── posts.service.js
│   │   ├── users.service.js     # login, profile edit, search, OAuth upsert
│   │   ├── network.service.js   # connections
│   │   ├── messages.service.js  # private messages
│   │   └── notifications.service.js
│   ├── auth-helpers.js      # currentUserId() — who is signed in?
│   ├── client.js            # the browser's API helper (one function per endpoint)
│   └── time.js
│
├── components/              # reusable UI pieces
│   ├── Avatar.jsx           # the cartoon SVG avatar (seeded by name)
│   ├── TopNav.jsx           # Home / My Network / Messaging / Notifications / Me
│   ├── Footer.jsx           # "copyright Shuo Ding 2026"
│   ├── ProfileSidebar.jsx   ├── TrendingTopics.jsx   (colourful topic icons)
│   ├── PostComposer.jsx     ├── FeedPost.jsx         └── CommentList.jsx
│
└── app/
    ├── layout.js            # root layout + <SessionProvider>
    ├── globals.css          # all styles + design tokens
    ├── login/page.jsx       # the sign-in screen
    ├── api/                 # the backend: one folder per endpoint (route.js)
    └── (app)/               # everything you see after logging in
        ├── layout.jsx       # guards the pages (redirects to /login) + nav + footer
        ├── page.jsx         # Home feed
        ├── network/  messaging/  notifications/  search/
        └── profile/  profile/[id]/
```

## How a request flows (e.g. clicking "Like")

1. **FeedPost.jsx** calls `api.react(postId)` in **lib/client.js**.
2. That sends `POST /api/posts/[id]/react`. The browser automatically includes the
   Auth.js session cookie.
3. The route handler **app/api/posts/[id]/react/route.js** calls
   `currentUserId()` to find out who is signed in, then calls the service
   `addReaction(postId, userId, type)`.
4. **posts.service.js** runs the SQL `INSERT` and returns the new count.
5. The page refreshes the feed and the new number appears.

Every feature follows this same path: **page → client.js → /api route → service → SQLite**.

## Why these choices

- **One Next.js app** — pages and API share the same code, types and database, so
  there is less to wire together and less to misunderstand.
- **Auth.js (`auth.js`)** — a single, well-known login module. Password login is
  always on; OAuth providers switch on by adding environment variables.
- **`node:sqlite`** — a real SQL database with **zero** install steps and no native
  build, so the project runs the same on every machine with Node 22.5+.
- **services/** — all SQL is in one place, separated from the web layer, so you can
  read the data logic on its own.
