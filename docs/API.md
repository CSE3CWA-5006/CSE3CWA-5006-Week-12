# API reference

All routes return JSON. Everything except the login routes requires a signed-in
session (the cookie is sent automatically by the browser). The "acting user" is
always the signed-in user — the client never sends a user id for writes.

## Auth (handled by Auth.js)
| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/auth/*` | Sign in, sign out, session, providers, callbacks |

## Feed & posts
| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/api/feed` | The feed (posts + reposts), newest first |
| POST | `/api/posts` | Create a post |
| GET  | `/api/posts/:id/comments` | List a post's comments |
| POST | `/api/posts/:id/comments` | Add a comment |
| POST | `/api/posts/:id/react` | Add a reaction |
| POST | `/api/posts/:id/repost` | Repost (optional note) |
| GET  | `/api/topics` | Trending topics |

## People & profile
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/profile` | The signed-in user |
| PUT | `/api/profile` | Save profile edits |
| GET | `/api/users` | Everyone |
| GET | `/api/users/:id` | One user (+ `connected`, `is_me`) |
| GET | `/api/search?q=` | Search people and posts |

## Network, messaging, notifications
| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/network` | `{ connections, suggestions }` |
| POST   | `/api/connections/:id` | Connect with a user |
| DELETE | `/api/connections/:id` | Remove a connection |
| GET    | `/api/messages` | My conversations |
| GET    | `/api/messages/:id` | One conversation |
| POST   | `/api/messages/:id` | Send a message |
| GET    | `/api/notifications` | Activity on my posts/connections |

## Demo
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/reset-demo-data` | Restore the original fake dataset |
