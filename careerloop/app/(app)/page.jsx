'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// Home — the three-column feed page. One /api/bootstrap call loads everything,
// so the first paint is fast and there is a single round trip.
import { useEffect, useState } from 'react';
import ProfileSidebar from '@/components/ProfileSidebar.jsx';
import TrendingTopics from '@/components/TrendingTopics.jsx';
import PeopleYouMayKnow from '@/components/PeopleYouMayKnow.jsx';
import PostComposer from '@/components/PostComposer.jsx';
import FeedPost from '@/components/FeedPost.jsx';
import { api } from '@/lib/client.js';

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [feed, setFeed] = useState([]);
  const [stats, setStats] = useState(null);
  const [people, setPeople] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.bootstrap().then((d) => {
      setProfile(d.profile); setTopics(d.topics); setFeed(d.feed);
      setStats(d.stats); setPeople(d.suggestions);
    }).catch(() => setError('Could not load your feed.'));
  }, []);

  const refresh = async () => setFeed(await api.feed());
  const onCreate  = async (d) => { await api.createPost(d); await refresh(); };
  const onReact   = async (id) => { await api.react(id); await refresh(); };
  const onRepost  = async (id, note) => { await api.repost(id, note); await refresh(); };
  const onComment = async (id, c) => { await api.addComment(id, c); await refresh(); };

  return (
    <div className="layout">
      <aside className="col-left"><ProfileSidebar profile={profile} stats={stats} /></aside>
      <section className="col-center">
        <PostComposer profile={profile} topics={topics} onCreate={onCreate} />
        {error && <div className="card error-banner">{error}</div>}
        {feed.map((item) => (
          <FeedPost key={`${item.type}-${item.post.id}-${item.feed_time}`} item={item}
            onReact={onReact} onRepost={onRepost} onComment={onComment} />
        ))}
      </section>
      <aside className="col-right"><TrendingTopics topics={topics} /><PeopleYouMayKnow people={people} /></aside>
    </div>
  );
}
