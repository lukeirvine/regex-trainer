import type { Metadata } from "next";
import { Suspense } from "react";
import { devLoginEnabled, signIn, signInProvider } from "@/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: PageProps<"/signin">) {
  return (
    <div className="flex justify-center pt-12">
      <div className="card bg-base-100 w-full max-w-sm shadow">
        <div className="card-body items-center text-center">
          <h1 className="code-text text-3xl font-semibold">
            <span className="text-primary">/</span>
            <span className="match-hl">re</span>gex
            <span className="text-primary">/</span>
          </h1>
          <p className="text-base-content/70">
            Drill everyday regular expressions until they&apos;re automatic. Sign in to save your progress.
          </p>
          <Suspense fallback={<div className="skeleton h-10 w-full" />}>
            <SignInButton searchParams={searchParams} />
          </Suspense>
          {devLoginEnabled && (
            <p className="text-base-content/50 text-xs">
              GitHub isn&apos;t configured, so this signs you in as a local dev user.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

async function SignInButton({ searchParams }: { searchParams: PageProps<"/signin">["searchParams"] }) {
  const { callbackUrl } = await searchParams;
  // Auth.js's default redirect callback discards anything that isn't same-origin.
  const redirectTo = typeof callbackUrl === "string" ? callbackUrl : "/app";

  return (
    <form
      className="w-full"
      action={async () => {
        "use server";
        await signIn(signInProvider, { redirectTo });
      }}
    >
      <button type="submit" className="btn btn-neutral w-full">
        {devLoginEnabled ? (
          "Continue as dev user"
        ) : (
          <>
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z" />
            </svg>
            Sign in with GitHub
          </>
        )}
      </button>
    </form>
  );
}
