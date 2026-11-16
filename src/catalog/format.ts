import type { Listing } from "@/catalog/types";

const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Format a monthly amount in Brazilian reais, or a dash when the value is unknown. */
export function formatBrl(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return CURRENCY.format(value);
}

/** Capitalize a provider key for display (`vivareal` -> `Vivareal`). */
export function providerLabel(provider: string): string {
  return provider.replace(/^./, (first) => first.toUpperCase());
}

/** Neighborhood and city when known, otherwise whatever free-text location the agency sent. */
export function locationLabel(listing: Pick<Listing, "neighborhood" | "city" | "location">): string {
  const parts = [listing.neighborhood, listing.city].filter((part): part is string => Boolean(part));
  if (parts.length > 0) {
    return parts.join(", ");
  }
  return listing.location ?? "Localização não informada";
}

/** Path of the listing's own page, or null when the agency gave no code to address it by. */
export function listingPath(listing: Pick<Listing, "provider" | "code">): string | null {
  if (!listing.code) {
    return null;
  }
  return `/imovel/${encodeURIComponent(listing.provider)}/${encodeURIComponent(listing.code)}`;
}
