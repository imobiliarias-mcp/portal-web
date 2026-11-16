"use client";

import Link from "next/link";
import { ArrowUpRight, BedDouble } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PhotoCarousel } from "@/components/search/PhotoCarousel";
import { Card } from "@/components/ui/card";
import { formatBrl, listingPath, locationLabel, providerLabel } from "@/catalog/format";
import type { Listing } from "@/catalog/types";

interface ListingCardProps {
  listing: Listing;
  onOpen: (listing: Listing) => void;
}

/** One listing: cover photo, total monthly cost, key facts and the official link. */
export function ListingCard({ listing, onOpen }: ListingCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:shadow-lg">
      <PhotoCarousel
        photos={listing.photos}
        fallback={listing.cover_photo}
        title={listing.title ?? "Imóvel"}
        onOpen={() => onOpen(listing)}
        overlay={<Badge className="pointer-events-none absolute left-3 top-3 bg-card/95 shadow-sm">{providerLabel(listing.provider)}</Badge>}
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{locationLabel(listing)}</p>
        <h3 className="line-clamp-2 text-sm font-medium">{listing.title ?? "Imóvel sem título"}</h3>
        <div>
          <p className="font-display text-2xl font-semibold">
            {formatBrl(listing.total_price)}
            <span className="font-sans text-xs font-normal text-muted-foreground"> /mês</span>
          </p>
          <p className="text-xs text-muted-foreground">
            aluguel {formatBrl(listing.rent_price)}
            {listing.condo_fee ? ` · condomínio ${formatBrl(listing.condo_fee)}` : ""}
            {listing.iptu ? ` · IPTU ${formatBrl(listing.iptu)}` : ""}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <Bedrooms count={listing.bedrooms} />
          <ListingLinks listing={listing} />
        </div>
      </div>
    </Card>
  );
}

function Bedrooms({ count }: { count: number | null }) {
  if (count === null) {
    return <span />;
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <BedDouble aria-hidden className="size-4" />
      {count} quarto(s)
    </span>
  );
}

/** Link to the listing's own page here, falling back to the agency's site when it has no code. */
export function ListingLinks({ listing }: { listing: Listing }) {
  const path = listingPath(listing);
  if (!path) {
    return <OfficialLink url={listing.official_url} />;
  }
  return (
    <Link href={path} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
      Ver detalhes
    </Link>
  );
}

interface OfficialLinkProps {
  url: string | null;
}

/** Link to the agency's own listing page; disabled when the provider gave no valid URL. */
export function OfficialLink({ url }: OfficialLinkProps) {
  if (!url) {
    return <span className="text-xs text-muted-foreground">Link indisponível</span>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      Ver no site oficial
      <ArrowUpRight aria-hidden className="size-4" />
    </a>
  );
}
