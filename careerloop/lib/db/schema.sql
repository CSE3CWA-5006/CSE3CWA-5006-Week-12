-- CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
-- Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
-- or network/SaaS deployment must keep this author copyright and stay under the AGPL.
-- DISCLAIMER: every name, job title and organisation here is fictitious and for
-- education only - no warranty, no liability. See the LICENSE file for full terms.
-- CareerLoop database schema (v2)
-- Eight small tables. The seed script runs this file, so every table is dropped first.

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS connections;
DROP TABLE IF EXISTS reposts;
DROP TABLE IF EXISTS reactions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS users;

-- People on the platform. Each one can log in with username + password.
-- NOTE: passwords are stored in plain text on purpose, ONLY because this is a
-- local teaching demo. A real app must hash passwords (e.g. with bcrypt).
CREATE TABLE users (
  id                 INTEGER PRIMARY KEY,
  name               TEXT    NOT NULL,
  username           TEXT    NOT NULL UNIQUE,   -- login name, e.g. "alexchen"
  password           TEXT    NOT NULL,          -- demo only — never do this for real
  role               TEXT    NOT NULL,          -- job title shown under the name
  location           TEXT    NOT NULL,
  university         TEXT    NOT NULL DEFAULT '',
  avatar_initials    TEXT    NOT NULL,          -- also used as the cartoon-avatar seed
  about              TEXT    NOT NULL DEFAULT '',
  skills             TEXT    NOT NULL,          -- comma-separated, kept simple
  connections        INTEGER NOT NULL DEFAULT 0,
  profile_completion INTEGER NOT NULL DEFAULT 0,
  is_me              INTEGER NOT NULL DEFAULT 0 -- marks the default demo account (Alex)
);

CREATE TABLE topics (
  id         INTEGER PRIMARY KEY,
  name       TEXT    NOT NULL UNIQUE,
  post_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE posts (
  id         INTEGER PRIMARY KEY,
  author_id  INTEGER NOT NULL REFERENCES users(id),
  content    TEXT    NOT NULL,
  topic      TEXT,
  visibility TEXT    NOT NULL DEFAULT 'Public',
  created_at TEXT    NOT NULL
);

CREATE TABLE comments (
  id         INTEGER PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  content    TEXT    NOT NULL,
  created_at TEXT    NOT NULL
);

CREATE TABLE reactions (
  id         INTEGER PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  type       TEXT    NOT NULL DEFAULT 'like',
  created_at TEXT    NOT NULL
);

CREATE TABLE reposts (
  id         INTEGER PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  note       TEXT,
  created_at TEXT    NOT NULL
);

-- A connection links two users. status is 'pending' until the addressee accepts.
-- message is the short note the requester sends with the invitation.
CREATE TABLE connections (
  id           INTEGER PRIMARY KEY,
  requester_id INTEGER NOT NULL REFERENCES users(id),
  addressee_id INTEGER NOT NULL REFERENCES users(id),
  status       TEXT    NOT NULL DEFAULT 'pending',  -- 'pending' or 'accepted'
  message      TEXT    NOT NULL DEFAULT '',
  created_at   TEXT    NOT NULL
);

-- A private message from one user to another (used by the Messaging page).
CREATE TABLE messages (
  id           INTEGER PRIMARY KEY,
  sender_id    INTEGER NOT NULL REFERENCES users(id),
  recipient_id INTEGER NOT NULL REFERENCES users(id),
  body         TEXT    NOT NULL,
  created_at   TEXT    NOT NULL
);
