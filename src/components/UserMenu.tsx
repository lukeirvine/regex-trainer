import Link from "next/link";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/session";

export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/signin" className="btn btn-primary btn-sm">
        Sign in
      </Link>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar avatar-placeholder">
        {user.image ? (
          <div className="w-8 rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.image} alt="" />
          </div>
        ) : (
          <div className="bg-neutral text-neutral-content w-8 rounded-full">
            <span className="text-xs">{user.name.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 mt-2 w-52 p-2 shadow-lg">
        <li className="menu-title truncate">{user.name}</li>
        <li>
          <Link href="/app">Dashboard</Link>
        </li>
        <li>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="w-full text-left">
              Sign out
            </button>
          </form>
        </li>
      </ul>
    </div>
  );
}
