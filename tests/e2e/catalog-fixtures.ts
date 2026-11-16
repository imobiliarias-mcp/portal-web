import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

const read = (name: string) => readFileSync(path.join(__dirname, "fixtures", name), "utf8");

/** Answers the core's read API with captured real responses, so tests do not depend on agency sites. */
export async function serveCatalogFixtures(page: Page): Promise<void> {
  const json = (body: string) => ({ status: 200, contentType: "application/json", body });
  await page.route("**/api/providers", (route) => route.fulfill(json(read("providers.json"))));
  await page.route("**/api/locations", (route) => route.fulfill(json(read("locations.json"))));
  await page.route("**/api/search?*", (route) => route.fulfill(json(read("search-cabralporto.json"))));
}

export const FIRST_LISTING = JSON.parse(read("search-cabralporto.json")).results[0] as {
  provider: string;
  code: string;
  title: string;
};
