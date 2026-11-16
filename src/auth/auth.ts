import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, organization } from "better-auth/plugins";
import { database } from "@/db/prisma";

/** Google is offered only when its credentials are configured. */
export function isGoogleSignInEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function googleProvider() {
  if (!isGoogleSignInEnabled()) {
    return {};
  }
  return {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  };
}

/** LGPD: the audit trail survives a deleted account, without pointing at the person. */
async function anonymizeAuditTrail(user: { id: string }): Promise<void> {
  await database().claimAuditLog.updateMany({ where: { actorUserId: user.id }, data: { actorUserId: null } });
}

/**
 * Advertisers sign in with Google. E-mail and password exists only for accounts created
 * by `npm run seed:admin` (the local administrator), so public sign-up is disabled.
 */
export const auth = betterAuth({
  database: prismaAdapter(database(), { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  socialProviders: googleProvider(),
  user: { deleteUser: { enabled: true, beforeDelete: anonymizeAuditTrail } },
  plugins: [admin(), organization(), nextCookies()],
});
