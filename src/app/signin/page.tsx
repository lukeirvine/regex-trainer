import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { devLoginEnabled, signIn, signInProviders } from "@/auth";

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
            <SignInButtons searchParams={searchParams} />
          </Suspense>
          {devLoginEnabled && (
            <p className="text-base-content/50 text-xs">
              No OAuth provider is configured, so this signs you in as a local dev user.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const buttons: Record<(typeof signInProviders)[number], { className: string; label: ReactNode }> = {
  dev: { className: "btn-neutral", label: "Continue as dev user" },
  github: {
    className: "btn-neutral",
    label: (
      <>
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z" />
        </svg>
        Sign in with GitHub
      </>
    ),
  },
  google: {
    className: "bg-base-100 border-base-300",
    label: (
      <>
        <svg className="size-5" viewBox="0 0 48 48" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Sign in with Google
      </>
    ),
  },
};

async function SignInButtons({ searchParams }: { searchParams: PageProps<"/signin">["searchParams"] }) {
  const { callbackUrl } = await searchParams;
  // Auth.js's default redirect callback discards anything that isn't same-origin.
  const redirectTo = typeof callbackUrl === "string" ? callbackUrl : "/app";

  return (
    <div className="flex w-full flex-col gap-2">
      {signInProviders.map((provider) => (
        <form
          key={provider}
          action={async () => {
            "use server";
            await signIn(provider, { redirectTo });
          }}
        >
          <button type="submit" className={`btn w-full ${buttons[provider].className}`}>
            {buttons[provider].label}
          </button>
        </form>
      ))}
    </div>
  );
}
