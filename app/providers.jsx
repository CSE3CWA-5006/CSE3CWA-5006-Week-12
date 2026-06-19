'use client';
// providers.jsx — makes the Auth.js session available to every client component.
import { SessionProvider } from 'next-auth/react';
export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
