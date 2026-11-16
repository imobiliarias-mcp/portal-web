import type { ClaimStatus } from "@/modules/advertiser-commerce/domain/claims/claim-decision";
import type { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";
import type { ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";

export interface ClaimRecord {
  id: string;
  advertiserId: string;
  target: ClaimTarget;
  status: ClaimStatus;
  evidence: string;
  decisionReason: string | null;
  createdAt: Date;
}

export interface NewClaim {
  advertiserId: string;
  actorUserId: string;
  target: ClaimTarget;
  evidence: string;
}

export interface StatusChange {
  claimId: string;
  actorUserId: string;
  from: ClaimStatus;
  to: ClaimStatus;
  reason: string | null;
}

export class ClaimChangedConcurrentlyError extends Error {}

/** Persistence of claims. Every write also appends to the audit log. */
export interface ClaimStore {
  /** True when the advertiser already has a pending or approved claim on this exact target. */
  hasOpenClaim(advertiserId: string, target: ClaimTarget): Promise<boolean>;
  create(claim: NewClaim): Promise<ClaimRecord>;
  find(claimId: string): Promise<ClaimRecord | null>;
  /** Moves the claim only if it is still in `from`; throws ClaimChangedConcurrentlyError otherwise. */
  changeStatus(change: StatusChange): Promise<void>;
  approvedTargets(advertiserId: string): Promise<ClaimTarget[]>;
}

/** What the aggregator core currently knows; used to refuse claims on things that do not exist. */
export interface ListingCatalog {
  sourceExists(providerId: string): Promise<boolean>;
  listingExists(ref: ListingRef): Promise<boolean>;
}
