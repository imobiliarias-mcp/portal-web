import { describe, expect, it } from "vitest";
import {
  AdvertiserLinks,
  ListingNotAuthorizedError,
} from "@/modules/advertiser-commerce/domain/advertiser/advertiser-links";
import { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";
import { ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";

describe("AdvertiserLinks", () => {
  it("authorizes nothing for an advertiser that only registered", () => {
    expect(new AdvertiserLinks([]).authorizes(ListingRef.parse("cabralporto", "10"))).toBe(false);
  });

  it("authorizes every listing of a linked source", () => {
    const links = new AdvertiserLinks([ClaimTarget.source("cabralporto")]);
    expect(links.authorizes(ListingRef.parse("cabralporto", "10"))).toBe(true);
    expect(links.authorizes(ListingRef.parse("cabralporto", "999"))).toBe(true);
  });

  it("does not extend a source link to another source", () => {
    const links = new AdvertiserLinks([ClaimTarget.source("cabralporto")]);
    expect(links.authorizes(ListingRef.parse("helenaimoveis", "10"))).toBe(false);
  });

  it("authorizes only the exact listing of a listing link", () => {
    const links = new AdvertiserLinks([ClaimTarget.listing("vivareal", "A1")]);
    expect(links.authorizes(ListingRef.parse("vivareal", "A1"))).toBe(true);
    expect(links.authorizes(ListingRef.parse("vivareal", "A2"))).toBe(false);
  });

  it("throws when asked to assert an unrelated listing", () => {
    const links = new AdvertiserLinks([ClaimTarget.listing("vivareal", "A1")]);
    expect(() => links.assertAuthorizes(ListingRef.parse("vivareal", "A2"))).toThrow(ListingNotAuthorizedError);
  });
});
