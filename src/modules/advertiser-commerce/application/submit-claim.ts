import type { ClaimRecord, ClaimStore, ListingCatalog } from "@/modules/advertiser-commerce/application/ports";
import type { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";
import type { SourcePolicy } from "@/modules/advertiser-commerce/domain/claims/source-policy";
import { ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";

export class UnknownClaimTargetError extends Error {}
export class DuplicateClaimError extends Error {}
export class InsufficientEvidenceError extends Error {}

export const MINIMUM_EVIDENCE_LENGTH = 20;
export const MAXIMUM_EVIDENCE_LENGTH = 2000;

export interface SubmitClaimInput {
  advertiserId: string;
  actorUserId: string;
  target: ClaimTarget;
  evidence: string;
}

/** Records a pending claim. It grants nothing: only an administrator's approval creates a link. */
export class SubmitClaim {
  constructor(
    private readonly claims: ClaimStore,
    private readonly catalog: ListingCatalog,
    private readonly policy: SourcePolicy,
  ) {}

  async execute(input: SubmitClaimInput): Promise<ClaimRecord> {
    const evidence = checkedEvidence(input.evidence);
    this.policy.assertClaimable(input.target);
    await this.assertTargetExists(input.target);
    if (await this.claims.hasOpenClaim(input.advertiserId, input.target)) {
      throw new DuplicateClaimError("There is already a pending or approved claim for this target");
    }
    return this.claims.create({ ...input, evidence });
  }

  private async assertTargetExists(target: ClaimTarget): Promise<void> {
    const plain = target.toPlain();
    const exists =
      plain.listingCode === null
        ? await this.catalog.sourceExists(plain.providerId)
        : await this.catalog.listingExists(ListingRef.parse(plain.providerId, plain.listingCode));
    if (!exists) {
      throw new UnknownClaimTargetError("The source or listing is not in the catalog right now");
    }
  }
}

function checkedEvidence(raw: string): string {
  const evidence = raw.trim();
  if (evidence.length < MINIMUM_EVIDENCE_LENGTH || evidence.length > MAXIMUM_EVIDENCE_LENGTH) {
    throw new InsufficientEvidenceError(
      `Evidence must have between ${MINIMUM_EVIDENCE_LENGTH} and ${MAXIMUM_EVIDENCE_LENGTH} characters`,
    );
  }
  return evidence;
}
