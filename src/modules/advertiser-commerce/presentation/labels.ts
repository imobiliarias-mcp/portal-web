import type { ClaimStatus } from "@/modules/advertiser-commerce/domain/claims/claim-decision";

export const ADVERTISER_TYPE_LABELS = {
  REAL_ESTATE_AGENCY: "Imobiliária",
  INDEPENDENT_BROKER: "Corretor autônomo",
} as const;

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  PENDING: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  REVOKED: "Revogado",
};

export const CLAIM_STATUS_TONES: Record<ClaimStatus, string> = {
  PENDING: "bg-accent/15 text-accent",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
  REVOKED: "bg-muted text-muted-foreground",
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

export function formatDate(date: Date): string {
  return DATE_FORMAT.format(date);
}

/** "Imobiliária inteira" for a source claim, or the listing code. */
export function claimTargetLabel(providerId: string, listingCode: string | null): string {
  return listingCode === null ? `${providerId} · todos os imóveis` : `${providerId} · imóvel ${listingCode}`;
}
