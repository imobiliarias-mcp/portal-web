import { database } from "@/db/prisma";
import { DecideClaim } from "@/modules/advertiser-commerce/application/decide-claim";
import { ListingAuthorization } from "@/modules/advertiser-commerce/application/listing-authorization";
import { SubmitClaim } from "@/modules/advertiser-commerce/application/submit-claim";
import { SourcePolicy } from "@/modules/advertiser-commerce/domain/claims/source-policy";
import { CoreListingCatalog } from "@/modules/advertiser-commerce/infrastructure/core-listing-catalog";
import { PrismaClaimStore } from "@/modules/advertiser-commerce/infrastructure/prisma-claim-store";

/** Wires the use cases to PostgreSQL and to the aggregator core. */
export function commerce() {
  const claims = new PrismaClaimStore(database());
  return {
    submitClaim: new SubmitClaim(claims, new CoreListingCatalog(), new SourcePolicy()),
    decideClaim: new DecideClaim(claims),
    listingAuthorization: new ListingAuthorization(claims),
    claims,
  };
}
