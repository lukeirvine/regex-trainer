import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

const oauthProviders = { github: GitHub, google: Google };
type OAuthProviderId = keyof typeof oauthProviders;

// Auth.js reads each provider's AUTH_<ID>_ID / AUTH_<ID>_SECRET; only offer the ones that are set.
const configured = (Object.keys(oauthProviders) as OAuthProviderId[]).filter(
  (id) => process.env[`AUTH_${id.toUpperCase()}_ID`],
);

/**
 * Without any OAuth credentials in development, offer a one-click "dev" sign-in so the
 * app is usable before an OAuth app exists. Never enabled in production builds.
 */
export const devLoginEnabled = configured.length === 0 && process.env.NODE_ENV !== "production";

/** Provider ids the sign-in page shows a button for, in display order. */
export const signInProviders: (OAuthProviderId | "dev")[] = devLoginEnabled ? ["dev"] : configured;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: devLoginEnabled
    ? [
        Credentials({
          id: "dev",
          name: "Dev",
          credentials: {},
          authorize: () => ({ id: "local", name: "Local Dev" }),
        }),
      ]
    : configured.map((id) => oauthProviders[id]),
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  trustHost: true,
  callbacks: {
    // Used by the proxy, which only runs on /app/** and /signin (see src/proxy.ts).
    authorized({ auth, request }) {
      if (request.nextUrl.pathname === "/signin") {
        // Already signed in: skip straight to the app.
        return auth?.user ? NextResponse.redirect(new URL("/app", request.url)) : true;
      }
      return !!auth?.user;
    },
    jwt({ token, account }) {
      // Stable, provider-scoped id, e.g. "github:1234567", "google:1098…" or "dev:local".
      // The same person signing in with two providers gets two separate progress records.
      if (account) token.uid = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});
