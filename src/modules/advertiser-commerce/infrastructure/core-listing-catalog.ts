import type { ListingCatalog } from "@/modules/advertiser-commerce/application/ports";
import type { ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";

export class CatalogUnavailableError extends Error {}

const DEFAULT_CORE_URL = "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 45_000;

interface ProviderEntry {
  provider_name: string;
}

/**
 * Asks the aggregator core, server to server, whether a source or listing exists right now.
 * Used only by authenticated claim submissions, so it stays far below the core's rate limit.
 */
export class CoreListingCatalog implements ListingCatalog {
  constructor(private readonly baseUrl: string = process.env.CENTRAL_MCP_API_URL ?? DEFAULT_CORE_URL) {}

  /** Ids of the sources the core currently serves. */
  async providerIds(): Promise<string[]> {
    const response = await this.request("/api/providers");
    if (!response.ok) {
      throw new CatalogUnavailableError(`Core answered ${response.status} for the provider list`);
    }
    const providers = (await response.json()) as ProviderEntry[];
    return providers.map((entry) => entry.provider_name);
  }

  async sourceExists(providerId: string): Promise<boolean> {
    const providerIds = await this.providerIds();
    return providerIds.includes(providerId);
  }

  /** A 404 or 400 means it does not exist; any other failure is reported, never treated as absence. */
  async listingExists(ref: ListingRef): Promise<boolean> {
    const { providerId, listingCode } = ref.toPlain();
    const response = await this.request(`/api/listings/${providerId}/${encodeURIComponent(listingCode)}`);
    if (response.ok) {
      return true;
    }
    if (response.status === 404 || response.status === 400) {
      return false;
    }
    throw new CatalogUnavailableError(`Core answered ${response.status} for ${providerId}/${listingCode}`);
  }

  private async request(path: string): Promise<Response> {
    try {
      return await fetch(new URL(path, this.baseUrl), {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      });
    } catch (cause) {
      throw new CatalogUnavailableError(`Core unreachable at ${path}`, { cause });
    }
  }
}
