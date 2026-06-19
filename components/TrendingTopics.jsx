'use client';
// TrendingTopics.jsx — the right column: colourful IT-career topic icons.
const TOPIC_STYLE = {
  'Software Engineering':     { icon: '🧑‍💻', colour: '#4F46E5' },
  'Cyber Security':           { icon: '🔒', colour: '#0EA5E9' },
  'Cloud Development':        { icon: '☁️', colour: '#3B82F6' },
  'Artificial Intelligence':  { icon: '🤖', colour: '#8B5CF6' },
  'Data Science':             { icon: '📊', colour: '#EF4444' },
  'DevOps':                   { icon: '⚙️', colour: '#F59E0B' },
  'UX Design':                { icon: '🎨', colour: '#EC4899' },
  'Embedded & Hardware':      { icon: '🔌', colour: '#10B981' },
  'Graduate Programs':        { icon: '🎓', colour: '#14B8A6' },
  'Internships':              { icon: '🌱', colour: '#84CC16' },
};
const fallback = { icon: '🏷️', colour: '#6B7280' };

export default function TrendingTopics({ topics }) {
  return (
    <div className="card">
      <h3 className="card-title">Trending fields</h3>
      <ul className="topics-list">
        {topics.map((t) => {
          const s = TOPIC_STYLE[t.name] || fallback;
          return (
            <li key={t.id} className="topic-row">
              <span className="topic-icon" style={{ background: s.colour + '22', color: s.colour }}>{s.icon}</span>
              <span className="topic-text">
                <span className="topic-name">{t.name}</span>
                <span className="topic-count">{t.post_count.toLocaleString('en-AU')} posts</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
