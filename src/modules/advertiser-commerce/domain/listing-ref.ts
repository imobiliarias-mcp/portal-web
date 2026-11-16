export class InvalidListingRefError extends Error {}

const PROVIDER_PATTERN = /^[a-z0-9]{1,64}$/;
const CODE_PATTERN = /^[^\s/<>"'\\]{1,100}$/;

/** Identifier of a listing source, as registered in the aggregator core. */
export class ProviderId {
  private constructor(private readonly value: string) {}

  static parse(raw: string): ProviderId {
    if (!PROVIDER_PATTERN.test(raw)) {
      throw new InvalidListingRefError("Invalid provider id");
    }
    return new ProviderId(raw);
  }

  equals(other: ProviderId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/** The only stable identity of a listing: the source and the code that source gives it. */
export class ListingRef {
  private constructor(
    private readonly provider: ProviderId,
    private readonly code: string,
  ) {}

  static parse(provider: string, code: string): ListingRef {
    if (!CODE_PATTERN.test(code)) {
      throw new InvalidListingRefError("Invalid listing code");
    }
    return new ListingRef(ProviderId.parse(provider), code);
  }

  equals(other: ListingRef): boolean {
    return this.provider.equals(other.provider) && this.code === other.code;
  }

  isFrom(provider: ProviderId): boolean {
    return this.provider.equals(provider);
  }

  toPlain(): { providerId: string; listingCode: string } {
    return { providerId: this.provider.toString(), listingCode: this.code };
  }
}
