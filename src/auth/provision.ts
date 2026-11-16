import { auth } from "@/auth/auth";

const MINIMUM_PASSWORD_LENGTH = 12;
const CREDENTIAL_PROVIDER = "credential";

export class InvalidProvisioningError extends Error {}

export interface CredentialUser {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}

/**
 * Creates an e-mail and password account, or resets the password and role of an existing one.
 * Idempotent. Public sign-up is disabled, so this is the only way such accounts come to exist.
 */
export async function ensureCredentialUser(input: CredentialUser): Promise<"created" | "updated"> {
  assertStrongPassword(input.password);
  const email = input.email.trim().toLowerCase();
  const context = await auth.$context;
  const passwordHash = await context.password.hash(input.password);
  const existing = await context.internalAdapter.findUserByEmail(email);
  if (existing) {
    await context.internalAdapter.updateUser(existing.user.id, { role: input.role, emailVerified: true });
    await context.internalAdapter.updatePassword(existing.user.id, passwordHash);
    return "updated";
  }
  const profile = { email, name: input.name, emailVerified: true, role: input.role };
  const user = await context.internalAdapter.createUser(profile, { method: "admin" });
  await context.internalAdapter.linkAccount({
    userId: user.id,
    providerId: CREDENTIAL_PROVIDER,
    accountId: user.id,
    password: passwordHash,
  });
  return "created";
}

/** Reads a required setting from the environment; throws naming the variable, never its value. */
export function requiredSetting(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new InvalidProvisioningError(`${name} is not set`);
  }
  return value;
}

function assertStrongPassword(password: string): void {
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new InvalidProvisioningError(`The password must have at least ${MINIMUM_PASSWORD_LENGTH} characters`);
  }
}
