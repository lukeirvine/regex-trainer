import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";

export type CurrentUser = { id: string; name: string; image: string | null };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // auth() generates random values (e.g. CSRF tokens), so make sure it only runs at request time.
  await connection();
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return { id: user.id, name: user.name ?? "You", image: user.image ?? null };
}

/** For pages and server actions: the signed-in user's id, or a redirect to sign in. */
export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user.id;
}
