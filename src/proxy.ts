export { auth as proxy } from "@/auth";

export const config = {
  // Everything under /app needs a session; the rest of the site is public.
  // /signin is included so signed-in users get sent on to the app.
  matcher: ["/app/:path*", "/signin"],
};
