import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

/** Browser tests run against an already running stack (`npm run dev` plus the core on :8000). */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    locale: "pt-BR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /search\.spec\.ts/ },
  ],
});
