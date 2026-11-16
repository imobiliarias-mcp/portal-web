import type { ClaimStore } from "@/modules/advertiser-commerce/application/ports";
import { AdvertiserLinks } from "@/modules/advertiser-commerce/domain/advertiser/advertiser-links";
import type { ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";

/** Single gate for every commercial operation on a listing. The listing id from the client is never enough. */
export class ListingAuthorization {
  constructor(private readonly claims: ClaimStore) {}

  /** Throws ListingNotAuthorizedError unless the advertiser has an approved link covering the listing. */
  async assertAuthorized(advertiserId: string, ref: ListingRef): Promise<void> {
    const links = new AdvertiserLinks(await this.claims.approvedTargets(advertiserId));
    links.assertAuthorizes(ref);
  }
}
