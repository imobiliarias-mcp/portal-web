import { ListingRef, ProviderId } from "@/modules/advertiser-commerce/domain/listing-ref";

export type ClaimScope = "SOURCE" | "LISTING";

/** What an advertiser says they represent: a whole source, or one listing of a source. */
export class ClaimTarget {
  private constructor(
    private readonly provider: ProviderId,
    private readonly listing: ListingRef | null,
  ) {}

  static source(providerId: string): ClaimTarget {
    return new ClaimTarget(ProviderId.parse(providerId), null);
  }

  static listing(providerId: string, listingCode: string): ClaimTarget {
    return new ClaimTarget(ProviderId.parse(providerId), ListingRef.parse(providerId, listingCode));
  }

  /** Rebuild a target from stored columns; a null code means the whole source. */
  static fromPlain(providerId: string, listingCode: string | null): ClaimTarget {
    return listingCode === null ? ClaimTarget.source(providerId) : ClaimTarget.listing(providerId, listingCode);
  }

  coversWholeSource(): boolean {
    return this.listing === null;
  }

  isOnProvider(providerId: string): boolean {
    return this.provider.toString() === providerId;
  }

  covers(ref: ListingRef): boolean {
    if (this.listing === null) {
      return ref.isFrom(this.provider);
    }
    return this.listing.equals(ref);
  }

  toPlain(): { scope: ClaimScope; providerId: string; listingCode: string | null } {
    const providerId = this.provider.toString();
    if (this.listing === null) {
      return { scope: "SOURCE", providerId, listingCode: null };
    }
    return { scope: "LISTING", ...this.listing.toPlain() };
  }
}
