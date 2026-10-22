import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

/**
 * Without GitHub OAuth credentials in development, offer a one-click "dev" sign-in so the
 * app is usable before an OAuth app exists. Never enabled in production builds.
 */
export const devLoginEnabled = !process.env.AUTH_GITHUB_ID && process.env.NODE_ENV !== "production";

export const signInProvider = devLoginEnabled ? "dev" : "github";

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
    : [GitHub],
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
      // Stable, provider-scoped id, e.g. "github:1234567" or "dev:local".
      if (account) token.uid = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});
