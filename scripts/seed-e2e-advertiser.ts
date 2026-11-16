/**
 * Test-only: creates a password account for the browser tests, because advertisers
 * normally sign in with Google. Reads E2E_ADVERTISER_EMAIL and E2E_ADVERTISER_PASSWORD.
 * Do not run against production.
 */
import { ensureCredentialUser, requiredSetting } from "@/auth/provision";

async function main(): Promise<void> {
  const email = requiredSetting("E2E_ADVERTISER_EMAIL");
  const outcome = await ensureCredentialUser({
    email,
    password: requiredSetting("E2E_ADVERTISER_PASSWORD"),
    name: "Anunciante de teste",
    role: "user",
  });
  console.log(`Test advertiser ${email} ${outcome}`);
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
