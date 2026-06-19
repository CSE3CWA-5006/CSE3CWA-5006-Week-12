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
