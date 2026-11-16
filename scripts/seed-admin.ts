/**
 * Creates the local administrator, or resets its password and role when it already exists.
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD; never prints the password.
 */
import { ensureCredentialUser, requiredSetting } from "@/auth/provision";

async function main(): Promise<void> {
  const email = requiredSetting("ADMIN_EMAIL");
  const outcome = await ensureCredentialUser({
    email,
    password: requiredSetting("ADMIN_PASSWORD"),
    name: "Administrador",
    role: "admin",
  });
  console.log(`Administrator ${email} ${outcome}`);
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
