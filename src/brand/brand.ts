import { z } from "zod";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const LOGO_REFERENCE = /^(https:\/\/|\/)[^\s"'<>]+$/;

const BrandSchema = z.object({
  name: z.string().trim().min(1).max(60),
  shortName: z.string().trim().min(1).max(20),
  tagline: z.string().trim().min(1).max(160),
  regionLabel: z.string().trim().min(1).max(60),
  primaryColor: z.string().regex(HEX_COLOR, "use #rrggbb"),
  accentColor: z.string().regex(HEX_COLOR, "use #rrggbb"),
  logoUrl: z.string().regex(LOGO_REFERENCE, "use https:// or an absolute path").optional(),
  supportEmail: z.email().optional(),
});

/** Visual identity of one deployment. Read on the server at request time, never baked into the build. */
export type Brand = z.infer<typeof BrandSchema>;

export class InvalidBrandError extends Error {}

type Environment = Record<string, string | undefined>;

/** Parse the BRAND_* variables; throws InvalidBrandError naming the offending variable. */
export function readBrand(env: Environment = process.env): Brand {
  const parsed = BrandSchema.safeParse({
    name: blankToUndefined(env.BRAND_NAME) ?? "Morada Vale do Aço",
    shortName: blankToUndefined(env.BRAND_SHORT_NAME) ?? "Morada",
    tagline: blankToUndefined(env.BRAND_TAGLINE) ?? "Todos os aluguéis das imobiliárias da região em uma única busca.",
    regionLabel: blankToUndefined(env.BRAND_REGION_LABEL) ?? "Vale do Aço",
    primaryColor: blankToUndefined(env.BRAND_PRIMARY_COLOR) ?? "#0f4c45",
    accentColor: blankToUndefined(env.BRAND_ACCENT_COLOR) ?? "#c2772b",
    logoUrl: blankToUndefined(env.BRAND_LOGO_URL),
    supportEmail: blankToUndefined(env.BRAND_SUPPORT_EMAIL),
  });
  if (!parsed.success) {
    throw new InvalidBrandError(`Invalid BRAND_* configuration: ${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

function blankToUndefined(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}
