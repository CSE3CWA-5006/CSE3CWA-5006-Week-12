// Root layout — wraps the whole site. Sets the language and loads global styles.
import './globals.css';
import Providers from './providers.jsx';

export const metadata = {
  title: 'CareerLoop — Professional Feed',
  description: 'A modular full-stack teaching app (Next.js + Auth.js + SQLite).',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
