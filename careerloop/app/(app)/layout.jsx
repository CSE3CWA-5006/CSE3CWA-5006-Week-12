/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// Layout for every signed-in page. Guards access, then shows the nav and footer.
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import TopNav from '@/components/TopNav.jsx';
import Footer from '@/components/Footer.jsx';

export default async function AppLayout({ children }) {
  const session = await auth();
  if (!session) redirect('/login'); // not logged in -> go to the login screen
  return (
    <div className="page">
      <TopNav />
      <div className="page-body">{children}</div>
      <Footer />
    </div>
  );
}
