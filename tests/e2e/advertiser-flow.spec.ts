import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";
import { serveCatalogFixtures } from "./catalog-fixtures";

const SCREENSHOT_DIR = process.env.E2E_SCREENSHOT_DIR;
/** Database the tested server uses; differs from DATABASE_URL when the server runs in a container. */
const DATABASE_SETTING = process.env.E2E_DATABASE_URL ? "E2E_DATABASE_URL" : "DATABASE_URL";

function requiredSetting(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set; see .env.example`);
  }
  return value;
}

const advertiser = { email: requiredSetting("E2E_ADVERTISER_EMAIL"), password: requiredSetting("E2E_ADVERTISER_PASSWORD") };
const admin = { email: requiredSetting("ADMIN_EMAIL"), password: requiredSetting("ADMIN_PASSWORD") };

/** Start from a user that has signed in before but has no advertiser profile or claims. */
async function forgetAdvertiserProfile(): Promise<void> {
  const client = new Client({ connectionString: requiredSetting(DATABASE_SETTING) });
  await client.connect();
  try {
    await client.query('DELETE FROM advertiser_profile WHERE "userId" IN (SELECT id FROM "user" WHERE email = $1)', [
      advertiser.email,
    ]);
  } finally {
    await client.end();
  }
}

async function signIn(page: Page, account: { email: string; password: string }): Promise<void> {
  await page.goto("/anunciantes/entrar");
  await page.getByText("Acesso da equipe").click();
  await page.getByLabel("E-mail").fill(account.email);
  await page.getByLabel("Senha").fill(account.password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

async function capture(page: Page, name: string): Promise<void> {
  if (SCREENSHOT_DIR) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true });
  }
}

test.beforeAll(forgetAdvertiserProfile);

test("the panel and the administration require a session", async ({ page }) => {
  await page.goto("/painel");
  await expect(page).toHaveURL(/\/anunciantes\/entrar$/);
  await page.goto("/admin/reivindicacoes");
  await expect(page).toHaveURL(/\/anunciantes\/entrar$/);
});

test("rejects a wrong password", async ({ page }) => {
  await page.goto("/anunciantes/entrar");
  await page.getByText("Acesso da equipe").click();
  await page.getByLabel("E-mail").fill(admin.email);
  await page.getByLabel("Senha").fill("not-the-password");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
});

test("an advertiser registers, claims a source, is approved and sees its listings", async ({ page, browser }) => {
  // Two sessions side by side: signing in and out repeatedly would trip the sign-in rate limit.
  const adminContext = await browser.newContext({ locale: "pt-BR" });
  const adminPage = await adminContext.newPage();
  await serveCatalogFixtures(page);

  await signIn(page, advertiser);
  await expect(page).toHaveURL(/\/painel\/cadastro$/);
  await page.getByLabel("Nome da imobiliária ou do corretor").fill("Imobiliária de Teste");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar perfil" }).click();
  await expect(page.getByRole("heading", { name: "Imobiliária de Teste" })).toBeVisible();
  await expect(page.getByText("Você ainda não tem vínculo verificado")).toBeVisible();
  await capture(page, "portal-web-painel-visao-geral");

  await page.goto("/painel/meus-imoveis");
  await expect(page.getByText("Nenhum vínculo aprovado")).toBeVisible();

  await page.goto("/painel/reivindicacoes");
  await page.getByLabel("Imobiliária ou portal de origem").selectOption("vivareal");
  await expect(page.getByLabel("O que você representa").locator("option")).toHaveCount(1);
  await page.getByLabel("Imobiliária ou portal de origem").selectOption("cabralporto");
  await page.getByLabel("Comprovação").fill("Sou sócio da imobiliária; escrevo do e-mail do domínio oficial.");
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page.getByText("Pedido enviado.")).toBeVisible();
  await expect(page.getByText("Em análise")).toBeVisible();
  await capture(page, "portal-web-painel-reivindicacoes");

  await expect(page.getByLabel("Imobiliária ou portal de origem")).toHaveValue("alecorretoramg");
  await page.getByLabel("Imobiliária ou portal de origem").selectOption("cabralporto");
  await page.getByLabel("Comprovação").fill("Segundo pedido para o mesmo alvo, que deve ser recusado.");
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page.getByText("Você já tem um pedido pendente ou aprovado")).toBeVisible();

  await page.goto("/admin/reivindicacoes");
  await expect(page.getByText("404")).toBeVisible();

  await signIn(adminPage, admin);
  await adminPage.goto("/admin/reivindicacoes");
  const claim = adminPage.getByRole("listitem").filter({ hasText: "Imobiliária de Teste" });
  await expect(claim.getByText("Em análise")).toBeVisible();
  await capture(adminPage, "portal-web-admin-reivindicacoes");
  await claim.getByRole("button", { name: "Aprovar" }).click();
  await expect(claim.getByText("Aprovado")).toBeVisible();
  await adminPage.goto("/admin/anunciantes");
  await expect(adminPage.getByRole("row").filter({ hasText: "Imobiliária de Teste" })).toContainText("1");

  await page.goto("/painel/meus-imoveis");
  await expect(page.getByRole("heading", { name: "cabralporto · todos os imóveis" })).toBeVisible();
  await expect(page.getByText("código 258")).toBeVisible();
  await capture(page, "portal-web-painel-meus-imoveis");
  const listing = page.getByRole("listitem").filter({ hasText: "código 258" });
  await listing.getByText("Reportar informação incorreta").click();
  await listing.getByLabel("O que está incorreto").fill("O valor do aluguel publicado está desatualizado.");
  await listing.getByRole("button", { name: "Enviar aviso" }).click();
  await expect(listing.getByText("Recebemos seu aviso.")).toBeVisible();

  await adminPage.goto("/admin/reivindicacoes");
  await expect(adminPage.getByText("O valor do aluguel publicado está desatualizado.")).toBeVisible();
  const approved = adminPage.getByRole("listitem").filter({ hasText: "anunciante-e2e" });
  await approved.getByLabel("Motivo da decisão").fill("Contrato encerrado.");
  await approved.getByRole("button", { name: "Revogar vínculo" }).click();
  await expect(approved.getByText("Revogado")).toBeVisible();

  await page.goto("/painel/meus-imoveis");
  await expect(page.getByText("Nenhum vínculo aprovado")).toBeVisible();
  await adminContext.close();
});
