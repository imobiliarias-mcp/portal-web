import { requireAdvertiser } from "@/auth/session";
import { Section } from "@/components/site/AccountShell";
import { database } from "@/db/prisma";
import { AGGREGATOR_PROVIDER_IDS } from "@/modules/advertiser-commerce/domain/claims/source-policy";
import { CoreListingCatalog } from "@/modules/advertiser-commerce/infrastructure/core-listing-catalog";
import { ClaimForm } from "@/modules/advertiser-commerce/presentation/components/ClaimForm";
import { ClaimStatusBadge } from "@/modules/advertiser-commerce/presentation/components/ClaimStatusBadge";
import { claimTargetLabel, formatDate } from "@/modules/advertiser-commerce/presentation/labels";

export default async function ClaimsPage() {
  const { advertiserId } = await requireAdvertiser();
  const [claims, providerIds] = await Promise.all([
    database().claim.findMany({ where: { advertiserId }, orderBy: { createdAt: "desc" } }),
    new CoreListingCatalog().providerIds().catch(() => []),
  ]);
  return (
    <>
      <h1 className="text-3xl font-medium">Pedidos de vínculo</h1>
      <Section title="Seus pedidos">
        {claims.length === 0 && <p className="text-sm text-muted-foreground">Você ainda não fez nenhum pedido.</p>}
        <ul className="grid gap-3">
          {claims.map((claim) => (
            <li key={claim.id} className="grid gap-1 rounded-xl border border-border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{claimTargetLabel(claim.providerId, claim.listingCode)}</span>
                <ClaimStatusBadge status={claim.status} />
              </div>
              <span className="text-xs text-muted-foreground">Enviado em {formatDate(claim.createdAt)}</span>
              {claim.decisionReason && <span className="text-muted-foreground">Motivo: {claim.decisionReason}</span>}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Novo pedido">
        {providerIds.length === 0 ? (
          <p role="alert" className="text-sm text-destructive">O catálogo não respondeu. Recarregue a página em instantes.</p>
        ) : (
          <ClaimForm providerIds={providerIds} aggregatorProviderIds={AGGREGATOR_PROVIDER_IDS} />
        )}
      </Section>
    </>
  );
}
