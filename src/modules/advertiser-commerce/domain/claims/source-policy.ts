import type { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";

export class AggregatorSourceNotClaimableError extends Error {}

/** Sources that republish listings of many agencies: nobody can represent them as a whole. */
export const AGGREGATOR_PROVIDER_IDS: readonly string[] = ["vivareal", "imovelweb"];

/** Which claims a kind of source accepts. */
export class SourcePolicy {
  constructor(private readonly aggregatorProviderIds: readonly string[] = AGGREGATOR_PROVIDER_IDS) {}

  assertClaimable(target: ClaimTarget): void {
    if (!target.coversWholeSource()) {
      return;
    }
    if (this.aggregatorProviderIds.some((providerId) => target.isOnProvider(providerId))) {
      throw new AggregatorSourceNotClaimableError("Aggregator sources accept listing-level claims only");
    }
  }
}
