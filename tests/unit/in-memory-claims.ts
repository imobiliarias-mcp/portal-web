import {
  ClaimChangedConcurrentlyError,
  type ClaimRecord,
  type ClaimStore,
  type ListingCatalog,
  type NewClaim,
  type StatusChange,
} from "@/modules/advertiser-commerce/application/ports";
import type { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";
import type { ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";

const sameTarget = (left: ClaimTarget, right: ClaimTarget) =>
  JSON.stringify(left.toPlain()) === JSON.stringify(right.toPlain());

export class InMemoryClaimStore implements ClaimStore {
  readonly audit: StatusChange[] = [];
  private readonly records: ClaimRecord[] = [];

  async hasOpenClaim(advertiserId: string, target: ClaimTarget): Promise<boolean> {
    return this.records.some(
      (record) =>
        record.advertiserId === advertiserId &&
        sameTarget(record.target, target) &&
        (record.status === "PENDING" || record.status === "APPROVED"),
    );
  }

  async create(claim: NewClaim): Promise<ClaimRecord> {
    const record: ClaimRecord = {
      id: `claim-${this.records.length + 1}`,
      advertiserId: claim.advertiserId,
      target: claim.target,
      status: "PENDING",
      evidence: claim.evidence,
      decisionReason: null,
      createdAt: new Date(),
    };
    this.records.push(record);
    return record;
  }

  async find(claimId: string): Promise<ClaimRecord | null> {
    return this.records.find((record) => record.id === claimId) ?? null;
  }

  async changeStatus(change: StatusChange): Promise<void> {
    const record = this.records.find((item) => item.id === change.claimId);
    if (!record || record.status !== change.from) {
      throw new ClaimChangedConcurrentlyError();
    }
    record.status = change.to;
    record.decisionReason = change.reason;
    this.audit.push(change);
  }

  async approvedTargets(advertiserId: string): Promise<ClaimTarget[]> {
    return this.records
      .filter((record) => record.advertiserId === advertiserId && record.status === "APPROVED")
      .map((record) => record.target);
  }
}

export class FixedCatalog implements ListingCatalog {
  constructor(
    private readonly sources: string[],
    private readonly listings: ListingRef[],
  ) {}

  async sourceExists(providerId: string): Promise<boolean> {
    return this.sources.includes(providerId);
  }

  async listingExists(ref: ListingRef): Promise<boolean> {
    return this.listings.some((listing) => listing.equals(ref));
  }
}
