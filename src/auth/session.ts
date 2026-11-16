import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { database } from "@/db/prisma";

export const SIGN_IN_PATH = "/anunciantes/entrar";
export const ONBOARDING_PATH = "/painel/cadastro";
const ADMIN_ROLE = "admin";

export interface SignedInUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface SignedInAdvertiser {
  user: SignedInUser;
  advertiserId: string;
}

/** The signed-in user, or null. Always read from the session cookie on the server. */
export async function currentUser(): Promise<SignedInUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }
  const { id, name, email, role } = session.user;
  return { id, name, email, isAdmin: role === ADMIN_ROLE };
}

/** Redirects to sign-in when nobody is signed in. */
export async function requireUser(): Promise<SignedInUser> {
  const user = await currentUser();
  if (!user) {
    redirect(SIGN_IN_PATH);
  }
  return user;
}

/** Answers 404 to anyone who is not an administrator, so the admin area is not advertised. */
export async function requireAdmin(): Promise<SignedInUser> {
  const user = await requireUser();
  if (!user.isAdmin) {
    notFound();
  }
  return user;
}

/** Redirects to onboarding when the user has not created an advertiser profile yet. */
export async function requireAdvertiser(): Promise<SignedInAdvertiser> {
  const user = await requireUser();
  const profile = await database().advertiserProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) {
    redirect(ONBOARDING_PATH);
  }
  return { user, advertiserId: profile.id };
}
