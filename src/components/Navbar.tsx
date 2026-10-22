import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const links = [
  { href: "/quiz", label: "Quiz" },
  { href: "/builder", label: "Builder" },
  { href: "/cheatsheet", label: "Cheat sheet" },
];

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
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="btn btn-ghost btn-sm">
            {l.label}
          </Link>
        ))}
        <ThemeToggle />
        <Suspense fallback={<div className="skeleton size-8 rounded-full" />}>
          <UserMenu />
        </Suspense>
      </nav>
    </header>
  );
}
