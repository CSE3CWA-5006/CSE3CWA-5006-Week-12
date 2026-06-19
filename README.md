# CareerLoop

A modular, beginner-friendly **professional social feed** — built as a single
**Next.js** full-stack app with **Auth.js** login and a **SQLite** database.
Made for teaching: small files, clear names, and a tidy path from a button click
all the way to the database and back.

> A LinkedIn-style three-column layout with original branding. Post, like,
> comment, repost, connect, message, search — all running locally with fake data.

## Quick start

```bash
npm install      # install dependencies
npm run seed     # create and fill the database (10 users + a full feed)
npm run dev      # start the dev server
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

## Documentation

- **docs/MANUAL.md** — full walkthrough, the demo accounts, and how to switch on
  GitHub / Google / Microsoft login.
- **docs/ARCHITECTURE.md** — how the code is organised and how a request flows.
- **docs/API.md** — every API endpoint.
- **docs/DATABASE.md** — the eight database tables.

*copyright Shuo Ding 2026*
