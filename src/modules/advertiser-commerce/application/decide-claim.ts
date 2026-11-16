import type { ClaimStore } from "@/modules/advertiser-commerce/application/ports";
import {
  decideClaim,
  type ClaimDecision,
  type ClaimStatus,
} from "@/modules/advertiser-commerce/domain/claims/claim-decision";

export class ClaimNotFoundError extends Error {}

export interface DecideClaimInput {
  claimId: string;
  actorUserId: string;
  decision: ClaimDecision;
}

/** An administrator approves, rejects or revokes a claim. Approval is what creates the link. */
export class DecideClaim {
  constructor(private readonly claims: ClaimStore) {}

  async execute({ claimId, actorUserId, decision }: DecideClaimInput): Promise<ClaimStatus> {
    const claim = await this.claims.find(claimId);
    if (!claim) {
      throw new ClaimNotFoundError(`Claim ${claimId} does not exist`);
    }
    const next = decideClaim(claim.status, decision);
    const reason = decision.reason?.trim() || null;
    await this.claims.changeStatus({ claimId, actorUserId, from: claim.status, to: next, reason });
    return next;
  }
}
