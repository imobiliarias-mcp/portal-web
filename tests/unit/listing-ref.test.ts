import { describe, expect, it } from "vitest";
import { InvalidListingRefError, ListingRef, ProviderId } from "@/modules/advertiser-commerce/domain/listing-ref";

describe("ProviderId", () => {
  it("accepts a registry id", () => {
    expect(ProviderId.parse("cabralporto").toString()).toBe("cabralporto");
  });

  it.each(["", "   ", "Cabral Porto", "../etc", "a".repeat(65)])("rejects %j", (raw) => {
    expect(() => ProviderId.parse(raw)).toThrow(InvalidListingRefError);
  });
});

describe("ListingRef", () => {
  it("is equal to another ref of the same provider and code", () => {
    expect(ListingRef.parse("vivareal", "AB-12").equals(ListingRef.parse("vivareal", "AB-12"))).toBe(true);
  });

  it("differs by provider or by code", () => {
    const ref = ListingRef.parse("vivareal", "AB-12");
    expect(ref.equals(ListingRef.parse("cabralporto", "AB-12"))).toBe(false);
    expect(ref.equals(ListingRef.parse("vivareal", "AB-13"))).toBe(false);
  });

  it.each(["", "  ", "a/b", "a b", "x".repeat(101)])("rejects the code %j", (code) => {
    expect(() => ListingRef.parse("vivareal", code)).toThrow(InvalidListingRefError);
  });
});
