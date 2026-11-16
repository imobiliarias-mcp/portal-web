"use client";

import { COVER_ASPECT, CoverImage } from "@/components/search/CoverImage";
import { ListingLinks } from "@/components/search/ListingCard";
import { formatBrl, locationLabel, providerLabel } from "@/catalog/format";
import type { Listing } from "@/catalog/types";

interface ListingRowProps {
  listing: Listing;
  onOpen: (listing: Listing) => void;
}

/** Compact list-view entry: thumbnail on the left, key facts on the right. */
export function ListingRow({ listing, onOpen }: ListingRowProps) {
  return (
    <article className="grid grid-cols-[7rem_1fr] gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-[10rem_1fr]">
      <button
        type="button"
        onClick={() => onOpen(listing)}
        className={`${COVER_ASPECT} overflow-hidden rounded-md bg-muted`}
        aria-label={`Ver detalhes: ${listing.title ?? "imóvel"}`}
      >
        <CoverImage src={listing.cover_photo} alt={listing.title ?? "Foto do imóvel"} />
      </button>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-xs text-muted-foreground">
          {providerLabel(listing.provider)} · {locationLabel(listing)}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium">{listing.title ?? "Imóvel sem título"}</h3>
        <p className="text-lg font-semibold">{formatBrl(listing.total_price)}</p>
        <p className="text-xs text-muted-foreground">
          {listing.bedrooms !== null ? `${listing.bedrooms} quarto(s)` : "quartos não informados"}
        </p>
        <div className="mt-auto pt-1">
          <ListingLinks listing={listing} />
        </div>
      </div>
    </article>
  );
}
