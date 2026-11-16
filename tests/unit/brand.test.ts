import { describe, expect, it } from "vitest";
import { InvalidBrandError, readBrand } from "@/brand/brand";

describe("readBrand", () => {
  it("uses the defaults when nothing is configured", () => {
    expect(readBrand({}).primaryColor).toBe("#0f4c45");
  });

  it("treats blank variables as not configured", () => {
    const brand = readBrand({ BRAND_NAME: "", BRAND_PRIMARY_COLOR: "  ", BRAND_LOGO_URL: "" });
    expect(brand.name).toBe("Morada Vale do Aço");
    expect(brand.primaryColor).toBe("#0f4c45");
    expect(brand.logoUrl).toBeUndefined();
  });

  it("applies the configured identity", () => {
    const brand = readBrand({ BRAND_NAME: "Casa Certa", BRAND_PRIMARY_COLOR: "#112233" });
    expect(brand).toMatchObject({ name: "Casa Certa", primaryColor: "#112233" });
  });

  it.each([{ BRAND_PRIMARY_COLOR: "red" }, { BRAND_LOGO_URL: "javascript:alert(1)" }, { BRAND_SUPPORT_EMAIL: "nope" }])(
    "rejects %j",
    (env) => {
      expect(() => readBrand(env)).toThrow(InvalidBrandError);
    },
  );
});
