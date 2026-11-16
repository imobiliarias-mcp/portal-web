import { describe, expect, it } from "vitest";
import { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";
import {
  AggregatorSourceNotClaimableError,
  SourcePolicy,
} from "@/modules/advertiser-commerce/domain/claims/source-policy";
import {
  decideClaim,
  InvalidClaimTransitionError,
  MissingDecisionReasonError,
} from "@/modules/advertiser-commerce/domain/claims/claim-decision";

const policy = new SourcePolicy(["vivareal", "imovelweb"]);

describe("SourcePolicy", () => {
  it("lets an agency source be claimed as a whole", () => {
    expect(() => policy.assertClaimable(ClaimTarget.source("cabralporto"))).not.toThrow();
  });

  it("refuses a source-level claim on an aggregator", () => {
    expect(() => policy.assertClaimable(ClaimTarget.source("vivareal"))).toThrow(AggregatorSourceNotClaimableError);
  });

  it("allows a single listing of an aggregator to be claimed", () => {
    expect(() => policy.assertClaimable(ClaimTarget.listing("vivareal", "123"))).not.toThrow();
  });
});

describe("decideClaim", () => {
  it("approves a pending claim", () => {
    expect(decideClaim("PENDING", { decision: "approve" })).toBe("APPROVED");
  });

  it("rejects a pending claim with a reason", () => {
    expect(decideClaim("PENDING", { decision: "reject", reason: "sem comprovação" })).toBe("REJECTED");
  });

  it("revokes an approved claim with a reason", () => {
    expect(decideClaim("APPROVED", { decision: "revoke", reason: "contrato encerrado" })).toBe("REVOKED");
  });

  it.each([
    ["APPROVED", "approve"],
    ["REJECTED", "approve"],
    ["REVOKED", "approve"],
    ["PENDING", "revoke"],
    ["REJECTED", "revoke"],
    ["APPROVED", "reject"],
  ] as const)("refuses %s -> %s", (status, decision) => {
    expect(() => decideClaim(status, { decision, reason: "motivo" })).toThrow(InvalidClaimTransitionError);
  });

  it.each(["reject", "revoke"] as const)("requires a reason to %s", (decision) => {
    const status = decision === "reject" ? "PENDING" : "APPROVED";
    expect(() => decideClaim(status, { decision, reason: "  " })).toThrow(MissingDecisionReasonError);
  });
});
