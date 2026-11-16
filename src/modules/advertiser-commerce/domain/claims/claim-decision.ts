export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
export type DecisionKind = "approve" | "reject" | "revoke";

export interface ClaimDecision {
  decision: DecisionKind;
  reason?: string;
}

export class InvalidClaimTransitionError extends Error {}
export class MissingDecisionReasonError extends Error {}

interface Transition {
  from: ClaimStatus;
  to: ClaimStatus;
  needsReason: boolean;
}

const TRANSITIONS: Record<DecisionKind, Transition> = {
  approve: { from: "PENDING", to: "APPROVED", needsReason: false },
  reject: { from: "PENDING", to: "REJECTED", needsReason: true },
  revoke: { from: "APPROVED", to: "REVOKED", needsReason: true },
};

/** Status a claim moves to under an administrator's decision; throws when the move is not allowed. */
export function decideClaim(current: ClaimStatus, { decision, reason }: ClaimDecision): ClaimStatus {
  const transition = TRANSITIONS[decision];
  if (transition.from !== current) {
    throw new InvalidClaimTransitionError(`Cannot ${decision} a claim that is ${current}`);
  }
  if (transition.needsReason && !reason?.trim()) {
    throw new MissingDecisionReasonError(`A reason is required to ${decision} a claim`);
  }
  return transition.to;
}
