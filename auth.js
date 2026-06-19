// auth.js — the universal login module (Auth.js / NextAuth v5).
//
// Two ways to sign in:
//   1. Username + password  (Credentials provider, checked against the database).
//   2. OAuth: GitHub, Google, Microsoft. Clicking a button performs a REAL redirect
//      to that provider's sign-in page. The providers read their keys from the
//      environment (AUTH_GITHUB_ID/SECRET, AUTH_GOOGLE_ID/SECRET,
//      AUTH_MICROSOFT_ENTRA_ID_ID/SECRET/ISSUER). As soon as you register an app on
//      the provider's side and add those keys to .env.local, the button works and a
//      real login completes — no code changes needed.
//
// The end user never has to register on CareerLoop: the first time they sign in with
// a provider we read their name and create a CareerLoop account for them.

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { loginWithPassword, upsertOAuthUser } from './lib/services/users.service.js';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // GitHub / Google / MicrosoftEntraID auto-read their keys from the environment,
  // so they are always wired up and ready the moment the keys are present.
  providers: [
    Credentials({
      name: 'Password',
      credentials: { username: { label: 'Username', type: 'text' }, password: { label: 'Password', type: 'password' } },
      authorize: (creds) => {
        const user = loginWithPassword(creds?.username, creds?.password);
        if (!user) return null;
        return { id: String(user.id), name: user.name, email: user.username };
      },
    }),
    // Guest: a reliable one-click entry that needs NO setup. It reuses a single
    // shared "Guest User" account, so it always works even with no OAuth keys.
    Credentials({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      authorize: () => {
        const uid = upsertOAuthUser({ provider: 'guest', providerId: 'guest', name: 'Guest User' });
        return { id: String(uid), name: 'Guest User', email: 'guest' };
      },
    }),
    GitHub,
    Google,
    MicrosoftEntraID,
  ],
  trustHost: true,
  session: { strategy: 'jwt' },     // required when using the Credentials provider
  pages: { signIn: '/login' },
  callbacks: {
    // Attach the LOCAL database user id to the token as "uid".
    async jwt({ token, user, account, profile }) {
      if (user && account?.type === 'credentials') {
        token.uid = Number(user.id);                      // password login
      } else if (account && account.type !== 'credentials' && profile) {
        // OAuth: find-or-create the CareerLoop user from the provider's profile.
        token.uid = upsertOAuthUser({
          provider: account.provider,
          providerId: account.providerAccountId,
          name: profile.name || profile.login || profile.email,
          email: profile.email,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid) session.uid = token.uid;
      return session;
    },
  },
});
