import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Server-component/action guard: returns the signed-in user or redirects to /login. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}
