/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
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
