import { beforeEach, describe, expect, it } from "vitest";
import { ClaimNotFoundError, DecideClaim } from "@/modules/advertiser-commerce/application/decide-claim";
import { ListingAuthorization } from "@/modules/advertiser-commerce/application/listing-authorization";
import {
  DuplicateClaimError,
  InsufficientEvidenceError,
  SubmitClaim,
  UnknownClaimTargetError,
} from "@/modules/advertiser-commerce/application/submit-claim";
import { ListingNotAuthorizedError } from "@/modules/advertiser-commerce/domain/advertiser/advertiser-links";
import { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";
import {
  AggregatorSourceNotClaimableError,
  SourcePolicy,
} from "@/modules/advertiser-commerce/domain/claims/source-policy";
import { InvalidListingRefError, ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";
import { FixedCatalog, InMemoryClaimStore } from "./in-memory-claims";

const EVIDENCE = "Sou sócio da imobiliária; e-mail do domínio oficial em anexo.";
const AGENCY = "advertiser-agency";
const BROKER = "advertiser-broker";
const ADMIN = "user-admin";
const AGENCY_LISTING = ListingRef.parse("cabralporto", "10");
const PORTAL_LISTING = ListingRef.parse("vivareal", "A1");

let store: InMemoryClaimStore;
let submit: SubmitClaim;
let decide: DecideClaim;
let authorization: ListingAuthorization;

beforeEach(() => {
  store = new InMemoryClaimStore();
  const catalog = new FixedCatalog(["cabralporto", "vivareal"], [AGENCY_LISTING, PORTAL_LISTING]);
  submit = new SubmitClaim(store, catalog, new SourcePolicy());
  decide = new DecideClaim(store);
  authorization = new ListingAuthorization(store);
});

const claimSource = (advertiserId: string, providerId: string) =>
  submit.execute({ advertiserId, actorUserId: advertiserId, target: ClaimTarget.source(providerId), evidence: EVIDENCE });

const claimListing = (advertiserId: string, providerId: string, code: string) =>
  submit.execute({ advertiserId, actorUserId: advertiserId, target: ClaimTarget.listing(providerId, code), evidence: EVIDENCE });

describe("claim workflow", () => {
  it("gives a registered advertiser no access before any claim", async () => {
    await expect(authorization.assertAuthorized(AGENCY, AGENCY_LISTING)).rejects.toThrow(ListingNotAuthorizedError);
  });

  it("keeps a submitted claim pending and without access", async () => {
    const claim = await claimSource(AGENCY, "cabralporto");
    expect(claim.status).toBe("PENDING");
    await expect(authorization.assertAuthorized(AGENCY, AGENCY_LISTING)).rejects.toThrow(ListingNotAuthorizedError);
  });

  it("gives a verified agency access to the listings of its source", async () => {
    const claim = await claimSource(AGENCY, "cabralporto");
    await decide.execute({ claimId: claim.id, actorUserId: ADMIN, decision: { decision: "approve" } });
    await expect(authorization.assertAuthorized(AGENCY, AGENCY_LISTING)).resolves.toBeUndefined();
  });

  it("lets an independent broker be linked to one authorized listing only", async () => {
    const claim = await claimListing(BROKER, "vivareal", "A1");
    await decide.execute({ claimId: claim.id, actorUserId: ADMIN, decision: { decision: "approve" } });
    await expect(authorization.assertAuthorized(BROKER, PORTAL_LISTING)).resolves.toBeUndefined();
    await expect(authorization.assertAuthorized(BROKER, ListingRef.parse("vivareal", "A2"))).rejects.toThrow(
      ListingNotAuthorizedError,
    );
  });

  it("does not let one advertiser use another advertiser's link", async () => {
    const claim = await claimSource(AGENCY, "cabralporto");
    await decide.execute({ claimId: claim.id, actorUserId: ADMIN, decision: { decision: "approve" } });
    await expect(authorization.assertAuthorized(BROKER, AGENCY_LISTING)).rejects.toThrow(ListingNotAuthorizedError);
  });

  it("removes access as soon as the link is revoked, and records who did it", async () => {
    const claim = await claimSource(AGENCY, "cabralporto");
    await decide.execute({ claimId: claim.id, actorUserId: ADMIN, decision: { decision: "approve" } });
    await decide.execute({ claimId: claim.id, actorUserId: ADMIN, decision: { decision: "revoke", reason: "contrato encerrado" } });
    await expect(authorization.assertAuthorized(AGENCY, AGENCY_LISTING)).rejects.toThrow(ListingNotAuthorizedError);
    expect(store.audit.at(-1)).toMatchObject({ actorUserId: ADMIN, from: "APPROVED", to: "REVOKED", reason: "contrato encerrado" });
  });

  it("records a rejection with its reason and grants nothing", async () => {
    const claim = await claimSource(AGENCY, "cabralporto");
    await decide.execute({ claimId: claim.id, actorUserId: ADMIN, decision: { decision: "reject", reason: "sem comprovação" } });
    expect((await store.find(claim.id))?.decisionReason).toBe("sem comprovação");
    await expect(authorization.assertAuthorized(AGENCY, AGENCY_LISTING)).rejects.toThrow(ListingNotAuthorizedError);
  });
});

describe("claim submission", () => {
  it("refuses a whole-source claim on an aggregator", async () => {
    await expect(claimSource(BROKER, "vivareal")).rejects.toThrow(AggregatorSourceNotClaimableError);
  });

  it("refuses a source the catalog does not have", async () => {
    await expect(claimSource(AGENCY, "inexistente")).rejects.toThrow(UnknownClaimTargetError);
  });

  it("refuses a listing the catalog does not return", async () => {
    await expect(claimListing(BROKER, "vivareal", "ZZ")).rejects.toThrow(UnknownClaimTargetError);
  });

  it("refuses a listing without a code", () => {
    expect(() => ClaimTarget.listing("vivareal", "")).toThrow(InvalidListingRefError);
  });

  it("refuses a second open claim on the same target", async () => {
    await claimSource(AGENCY, "cabralporto");
    await expect(claimSource(AGENCY, "cabralporto")).rejects.toThrow(DuplicateClaimError);
  });

  it("accepts a new claim after a rejection", async () => {
    const first = await claimSource(AGENCY, "cabralporto");
    await decide.execute({ claimId: first.id, actorUserId: ADMIN, decision: { decision: "reject", reason: "sem comprovação" } });
    await expect(claimSource(AGENCY, "cabralporto")).resolves.toMatchObject({ status: "PENDING" });
  });

  it("refuses a claim with almost no evidence", async () => {
    const attempt = submit.execute({ advertiserId: AGENCY, actorUserId: AGENCY, target: ClaimTarget.source("cabralporto"), evidence: "sou eu" });
    await expect(attempt).rejects.toThrow(InsufficientEvidenceError);
  });

  it("fails on a claim id that does not exist", async () => {
    await expect(decide.execute({ claimId: "nope", actorUserId: ADMIN, decision: { decision: "approve" } })).rejects.toThrow(
      ClaimNotFoundError,
    );
  });
});
