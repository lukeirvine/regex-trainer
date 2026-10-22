import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

type NavLink = { href: string; label: string };

const memberLinks: NavLink[] = [
  { href: "/quiz", label: "Quiz" },
  { href: "/builder", label: "Builder" },
];

const publicLinks: NavLink[] = [{ href: "/cheatsheet", label: "Cheat sheet" }];

function NavLinks({ links }: { links: NavLink[] }) {
  return links.map((l) => (
    <Link key={l.href} href={l.href} className="btn btn-ghost btn-sm">
      {l.label}
    </Link>
  ));
}

async function MemberLinks() {
  const user = await getCurrentUser();
  return user ? <NavLinks links={memberLinks} /> : null;
}

export function Navbar() {
  return (
    <header className="navbar bg-base-100 border-base-300 sticky top-0 z-20 border-b px-4">
      <div className="flex-1">
        <Link href="/" className="code-text text-lg font-semibold">
          <span className="text-primary">/</span>regex<span className="text-primary">/</span>
          <span className="text-base-content/60 hidden sm:inline">trainer</span>
        </Link>
      </div>
      <nav className="flex items-center gap-1">
        <Suspense>
          <MemberLinks />
        </Suspense>
        <NavLinks links={publicLinks} />
        <ThemeToggle />
        <Suspense fallback={<div className="skeleton size-8 rounded-full" />}>
          <UserMenu />
        </Suspense>
      </nav>
    </header>
  );
}
