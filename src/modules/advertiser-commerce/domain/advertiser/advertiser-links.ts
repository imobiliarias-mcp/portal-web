import type { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";
import type { ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";

export class ListingNotAuthorizedError extends Error {}

/** The approved claims of one advertiser: the only thing that authorizes acting on a listing. */
export class AdvertiserLinks {
  constructor(private readonly approvedTargets: readonly ClaimTarget[]) {}

  authorizes(ref: ListingRef): boolean {
    return this.approvedTargets.some((target) => target.covers(ref));
  }

  assertAuthorizes(ref: ListingRef): void {
    if (!this.authorizes(ref)) {
      throw new ListingNotAuthorizedError("The advertiser has no approved link to this listing");
    }
  }
}
