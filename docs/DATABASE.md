# Database

One SQLite file (`data/careerloop.db`), created by `npm run seed` from
`lib/db/schema.sql`. Eight small tables.

| Table | What it stores |
|-------|----------------|
| `users` | People + their login (`username`, `password`), role, about, skills. *Passwords are plain text **only** because this is a local teaching demo — a real app must hash them.* |
| `topics` | Trending topic names and post counts |
| `posts` | A post: author, content, topic, visibility, time |
| `comments` | A comment on a post |
| `reactions` | A reaction (like/insightful/celebrate) on a post |
| `reposts` | A repost of a post, with an optional note |
| `connections` | Links two users (one row per pair, either direction = connected) |
| `messages` | A private message from one user to another |

### Relationships (simplified)

```
users 1───* posts 1───* comments
  │            └──* reactions
  │            └──* reposts
  ├──* connections (user ↔ user)
  └──* messages    (sender → recipient)
```

The seed creates **10 users, 7 topics, 17 posts, 22 comments, 56 reactions,
3 reposts, 9 connections and 6 messages**.
