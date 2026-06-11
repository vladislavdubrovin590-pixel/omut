import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import type { Role, User } from "@prisma/client";

/**
 * Use in server components / layouts to gate by role.
 * Returns the user or redirects to /login (or /cabinet if wrong role).
 */
export async function requirePageUser(roles?: Role[]): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/cabinet");
  return user;
}

/** For API routes: returns user or null (no redirect). */
export async function getApiUser(roles?: Role[]): Promise<User | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return user;
}
