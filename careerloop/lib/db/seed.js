/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// seed.js — fills the database with 10 fake users and a lively feed.
// Run:  npm run seed   (from the backend folder). Also used by POST /api/reset-demo-data.

import { db, applySchema } from './database.js';

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export function seedDatabase() {
  applySchema(); // clean slate every time

  // ---- 1. USERS (10). Every user can log in. Password pattern: <username>1234. ----
  // [name, username, password, role, location, initials, about, skills, connections, completion, is_me]
  const users = [
    ['Alex Chen', 'alexchen', 'alexchen1234', 'Final-year Software Student', 'Melbourne, AU', 'AC',
      'Final-year software student who loves building full-stack side projects.', 'React, Node.js, SQL, Git', 142, 80, 1],
    ['Emily Carter', 'emilycarter', 'emilycarter1234', 'Cloud Engineer', 'Sydney, AU', 'EC',
      'Cloud engineer focused on reliable, low-stress deployments.', 'AWS, Docker, Terraform', 980, 95, 0],
    ['Daniel Walker', 'danielwalker', 'danielwalker1234', 'Data Analyst', 'Brisbane, AU', 'DW',
      'Data analyst who believes a clear chart beats a clever one.', 'Python, SQL, Power BI', 540, 88, 0],
    ['Mei Lin', 'meilin', 'meilin1234', 'Technical Recruiter', 'Melbourne, AU', 'ML',
      'Technical recruiter helping graduates find their first role.', 'Hiring, Interviewing, Talent', 2300, 92, 0],
    ['Tom Becker', 'tombecker', 'tombecker1234', 'Startup Founder', 'Perth, AU', 'TB',
      'Founder. Talks to users before writing code.', 'Product, Strategy, Pitching', 1750, 90, 0],
    ['Grace Mitchell', 'gracemitchell', 'gracemitchell1234', 'Project Manager', 'Adelaide, AU', 'GM',
      'Project manager who likes short stand-ups and clear plans.', 'Agile, Scrum, Stakeholders', 1200, 87, 0],
    ['Lucas Bennett', 'lucasbennett', 'lucasbennett1234', 'DevOps Engineer', 'Sydney, AU', 'LB',
      'DevOps engineer automating the boring parts.', 'CI/CD, Kubernetes, Linux', 860, 91, 0],
    ['Hannah Wright', 'hannahwright', 'hannahwright1234', 'UX Designer', 'Canberra, AU', 'HW',
      'UX designer. The best feature is often the one you remove.', 'Figma, Research, Accessibility', 720, 89, 0],
    ['Noah Taylor', 'noahtaylor', 'noahtaylor1234', 'Backend Developer', 'Melbourne, AU', 'NT',
      'Backend developer who enjoys clean APIs and good docs.', 'Node.js, PostgreSQL, APIs', 610, 86, 0],
    ['Wei Zhang', 'weizhang', 'weizhang1234', 'Cybersecurity Analyst', 'Sydney, AU', 'WZ',
      'Security analyst. Least privilege, always.', 'Security, Networks, Linux', 430, 84, 0],
  ];
  const insertUser = db.prepare(
    `INSERT INTO users (name, username, password, role, location, avatar_initials, about, skills, connections, profile_completion, is_me)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const u of users) insertUser.run(...u);

  // Give each user a (real) Australian university. Alex is at La Trobe.
  const universities = [
    'La Trobe University', 'Monash University', 'The University of Melbourne', 'RMIT University',
    'The University of Sydney', 'UNSW Sydney', 'The University of Queensland',
    'Australian National University', 'The University of Adelaide', 'The University of Western Australia',
  ];
  const setUni = db.prepare('UPDATE users SET university = ? WHERE id = ?');
  universities.forEach((uni, i) => setUni.run(uni, i + 1));

  // ---- 2. TOPICS (real IT career fields, used as post categories) ----
  const topics = [
    ['Software Engineering', 2120], ['Cyber Security', 1680], ['Cloud Development', 1450],
    ['Artificial Intelligence', 1990], ['Data Science', 1240], ['DevOps', 760],
    ['UX Design', 680], ['Embedded & Hardware', 410], ['Graduate Programs', 1560],
    ['Internships', 890],
  ];
  const insertTopic = db.prepare('INSERT INTO topics (name, post_count) VALUES (?, ?)');
  for (const t of topics) insertTopic.run(...t);

  // ---- 3. POSTS (17). [authorId, content, topic, minutesAgo] ----
  const posts = [
    [2, 'Shipped our first blue/green deployment on AWS today. Zero downtime and a calmer team. Worth the setup effort.', 'Cloud Development', 60],
    [3, 'Reminder: a clear chart beats a clever one. If a stakeholder has to ask "what am I looking at?", the chart has failed.', 'Artificial Intelligence', 95],
    [5, 'Hiring our first graduate engineer. We are looking for curiosity and good questions, not a perfect CV. Applications open this week.', 'Graduate Programs', 140],
    [9, 'Wrote a small API style guide for our team: consistent names, clear errors, and an example request for every endpoint. Future us will be grateful.', 'Software Engineering', 150],
    [7, 'Cut our CI pipeline from 14 minutes to 5 by caching dependencies. Small change, big morale boost.', 'DevOps', 180],
    [8, 'Accessibility tip: colour alone should never carry meaning. Add a label or an icon so everyone can follow along.', 'UX Design', 220],
    [10, 'Security basics that prevent most incidents: patch quickly, use least privilege, and never log secrets. Boring, and that is the point.', 'Cyber Security', 240],
    [4, 'Three things that make a graduate application stand out: a project you can explain, a tidy GitHub, and one clear sentence on what you want to learn.', 'Graduate Programs', 260],
    [6, 'Good stand-ups answer three questions and end on time. Everything else belongs in a separate chat.', 'Software Engineering', 320],
    [2, 'If your database is the bottleneck, add an index before you add a server. Measure first, then scale.', 'Data Science', 380],
    [3, 'Started learning SQL window functions this week. RANK() and LAG() already saved me a pile of messy code.', 'Data Science', 440],
    [7, 'Containers are not magic. They are just your app plus its dependencies in a tidy box. Once that clicks, Docker gets much easier.', 'Cloud Development', 520],
    [5, 'Founder lesson: talk to ten users before writing a hundred lines of code. The roadmap writes itself.', 'Software Engineering', 600],
    [8, 'Redesigned our onboarding flow from 7 steps to 3. The best feature is often the one you remove.', 'UX Design', 700],
    [2, 'A short guide to least privilege: give each service the smallest set of permissions it needs, then add more only when something breaks.', 'Cyber Security', 820],
    [1, 'Final-year project update: built a small full-stack feed app to revise everything from this semester. Frontend, API, and database finally make sense together.', 'Internships', 900],
    [6, 'Sensors are cheap; clean sensor data is not. Plan for missing readings before you build the dashboard.', 'Embedded & Hardware', 1000],
  ];
  const insertPost = db.prepare(
    'INSERT INTO posts (author_id, content, topic, visibility, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  for (const [authorId, content, topic, mins] of posts) {
    insertPost.run(authorId, content, topic, 'Public', minutesAgo(mins));
  }

  // ---- 4. COMMENTS. [postId, userId, content, minutesAgo] ----
  const comments = [
    [1, 5, 'Congratulations! Blue/green is a game changer for releases.', 50],
    [1, 7, 'Did you automate the traffic switch or do it manually?', 45],
    [1, 2, 'Automated through the load balancer — happy to share notes.', 40],
    [2, 8, 'So true. Clarity is a feature, not an afterthought.', 90],
    [2, 6, 'Saving this for our next reporting review.', 88],
    [3, 1, 'This is really encouraging to read as a final-year student!', 130],
    [3, 4, 'Great attitude to hire for. Best of luck with applications.', 128],
    [5, 2, 'Dependency caching is underrated. Nice win.', 175],
    [6, 1, 'Adding icons to our status badges today because of this.', 210],
    [6, 3, 'Accessibility is everyone’s job. Thanks for the reminder.', 205],
    [8, 1, 'Bookmarked — exactly what I needed before applying.', 250],
    [8, 7, 'The "one clear sentence" point is gold.', 248],
    [9, 5, 'Ending on time is the hardest part!', 315],
    [10, 3, 'Indexes first, always. Learned this the hard way.', 370],
    [11, 2, 'Window functions changed how I write reports.', 435],
    [12, 1, 'The "tidy box" explanation finally made Docker click for me.', 510],
    [13, 6, 'Talking to users early saves so much rework.', 590],
    [14, 1, 'Removing steps is harder than adding them. Nice result.', 690],
    [15, 7, 'Least privilege should be the default everywhere.', 810],
    [16, 3, 'Love seeing student projects that tie it all together.', 890],
    [16, 8, 'The frontend/backend/database click is the best feeling.', 885],
    [17, 2, 'Missing-data handling is half the work in IoT. Good call.', 990],
  ];
  const insertComment = db.prepare(
    'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)'
  );
  for (const [postId, userId, content, mins] of comments) {
    insertComment.run(postId, userId, content, minutesAgo(mins));
  }

  // ---- 5. REACTIONS. [postId, [userIds...], type] ----
  const reactions = [
    [1, [1, 3, 4, 5, 6, 7], 'like'], [2, [1, 5, 6, 8], 'insightful'], [3, [1, 2, 6, 7, 8], 'celebrate'],
    [4, [2, 3, 7], 'insightful'], [5, [2, 3, 5], 'like'], [6, [1, 3, 4], 'insightful'],
    [7, [2, 6, 10], 'like'], [8, [1, 5, 7], 'like'], [9, [2, 8], 'like'], [10, [3, 7], 'insightful'],
    [11, [1, 2], 'like'], [12, [1, 5, 6, 8], 'celebrate'], [13, [2, 3, 7], 'like'], [14, [3, 7], 'insightful'],
    [15, [2, 6, 7], 'insightful'], [16, [2, 3, 4, 5, 6, 8], 'celebrate'], [17, [3, 7], 'like'],
  ];
  const insertReaction = db.prepare(
    'INSERT INTO reactions (post_id, user_id, type, created_at) VALUES (?, ?, ?, ?)'
  );
  for (const [postId, userIds, type] of reactions) {
    for (const userId of userIds) insertReaction.run(postId, userId, type, minutesAgo(30));
  }

  // ---- 6. REPOSTS. [originalPostId, byUserId, note, minutesAgo] ----
  const reposts = [
    [3, 1, 'Sharing for anyone job-hunting this semester — great mindset.', 120],
    [12, 6, 'The best Docker explanation I have read this year.', 480],
    [15, 7, '', 700],
  ];
  const insertRepost = db.prepare(
    'INSERT INTO reposts (post_id, user_id, note, created_at) VALUES (?, ?, ?, ?)'
  );
  for (const [postId, userId, note, mins] of reposts) {
    insertRepost.run(postId, userId, note || null, minutesAgo(mins));
  }

  // ---- 7. CONNECTIONS. [requester, addressee, status, message] ----
  //   'accepted' = already connected; 'pending' = waiting for the addressee to accept.
  const connections = [
    [1, 2, 'accepted', ''], [1, 4, 'accepted', ''], [1, 6, 'accepted', ''],
    [2, 7, 'accepted', ''], [5, 6, 'accepted', ''], [9, 10, 'accepted', ''],
    // Two people have asked Alex (user 1) to connect — these show as invitations.
    [8, 1, 'pending', 'Hi Alex, loved your final-year project — let us connect!'],
    [10, 1, 'pending', 'Security folks should stick together. Connect?'],
    // Alex has sent one request that is still pending.
    [1, 3, 'pending', 'Hi Daniel, keen to learn more about data analysis.'],
  ];
  const insertConn = db.prepare(
    'INSERT INTO connections (requester_id, addressee_id, status, message, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  for (const [a, b, status, message] of connections) insertConn.run(a, b, status, message, minutesAgo(2000));

  // ---- 8. MESSAGES. [senderId, recipientId, body, minutesAgo] ----
  const messages = [
    [4, 1, 'Hi Alex! I saw your final-year project post — really impressive.', 200],
    [1, 4, 'Thank you, Mei! Happy to share the repo if useful.', 190],
    [4, 1, 'Please do. We have a graduate role opening soon that might suit you.', 180],
    [2, 1, 'Nice work on the feed app. Are you using Docker for it?', 150],
    [1, 2, 'Not yet — planning to containerise the backend next. Any tips?', 140],
    [2, 1, 'Start with a tiny Dockerfile and one compose file. Keep it boring.', 130],
  ];
  const insertMsg = db.prepare(
    'INSERT INTO messages (sender_id, recipient_id, body, created_at) VALUES (?, ?, ?, ?)'
  );
  for (const [s, r, body, mins] of messages) insertMsg.run(s, r, body, minutesAgo(mins));

  return {
    users: users.length, topics: topics.length, posts: posts.length,
    comments: comments.length, reposts: reposts.length,
    connections: connections.length, messages: messages.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Seeding CareerLoop demo data...');
  console.log('Done:', seedDatabase());
}
