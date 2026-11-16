import { expect, test } from "@playwright/test";
import { FIRST_LISTING, serveCatalogFixtures } from "./catalog-fixtures";

test.beforeEach(async ({ page }) => {
  await serveCatalogFixtures(page);
});

test("shows the brand and the listings of the search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("7 de 7 imóvel(is)")).toBeVisible();
  await expect(page.getByRole("heading", { name: FIRST_LISTING.title }).first()).toBeVisible();
});

test("restores filters, order and view from the URL", async ({ page }) => {
  await page.goto("/?max=2000&ordem=total_desc&vista=lista");
  await expect(page.getByRole("button", { name: "Lista" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Ordenar por")).toHaveValue("total_desc");
  await expect(page).toHaveURL(/max=2000/);
});

test("writes the chosen view to the URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lista" }).click();
  await expect(page).toHaveURL(/vista=lista/);
});

test("opens a listing in its own page", async ({ page }) => {
  await page.route(`**/api/listings/${FIRST_LISTING.provider}/${FIRST_LISTING.code}`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(FIRST_LISTING) }),
  );
  await page.goto("/");
  await page.getByRole("link", { name: "Ver detalhes" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/imovel/${FIRST_LISTING.provider}/${FIRST_LISTING.code}$`));
  await expect(page.getByRole("link", { name: "Voltar à busca" })).toBeVisible();
});

test("serves a manifest named after the brand", async ({ request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.icons).toHaveLength(2);
});
