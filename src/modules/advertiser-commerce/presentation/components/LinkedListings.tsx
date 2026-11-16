"use client";

import { useEffect, useState } from "react";
import { fetchListing, searchListings } from "@/catalog/api";
import { formatBrl, listingPath, locationLabel } from "@/catalog/format";
import type { Listing } from "@/catalog/types";
import { CoverImage } from "@/components/search/CoverImage";
import { Skeleton } from "@/components/ui/skeleton";
import { CorrectionForm } from "@/modules/advertiser-commerce/presentation/components/CorrectionForm";

const SOURCE_PAGE_SIZE = 50;

type LoadState = { status: "loading" } | { status: "ready"; listings: Listing[] } | { status: "unavailable" };

interface LinkedListingsProps {
  providerId: string;
  /** Null when the link covers the whole source. */
  listingCode: string | null;
}

/** Live, read-only view of the listings behind one approved link. */
export function LinkedListings({ providerId, listingCode }: LinkedListingsProps) {
  const state = useLinkedListings(providerId, listingCode);
  if (state.status === "loading") {
    return <Skeleton className="h-24 w-full" />;
  }
  if (state.status === "unavailable") {
    return <p className="text-sm text-muted-foreground">Indisponível no momento. A imobiliária não respondeu; tente mais tarde.</p>;
  }
  if (state.listings.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum imóvel para alugar publicado por esta fonte agora.</p>;
  }
  return (
    <ul className="grid gap-3">
      {state.listings.map((listing) => (
        <LinkedListing key={`${listing.provider}-${listing.code}`} listing={listing} />
      ))}
    </ul>
  );
}

function LinkedListing({ listing }: { listing: Listing }) {
  const path = listingPath(listing);
  return (
    <li className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[8rem_1fr]">
      <div className="aspect-[4/3] overflow-hidden rounded-md bg-muted">
        <CoverImage src={listing.cover_photo} alt={listing.title ?? "Foto do imóvel"} />
      </div>
      <div className="grid content-start gap-1 text-sm">
        <p className="text-xs text-muted-foreground">
          {locationLabel(listing)} · código {listing.code ?? "não informado"}
        </p>
        <p className="font-medium">{listing.title ?? "Imóvel sem título"}</p>
        <p className="font-display text-lg font-semibold">{formatBrl(listing.total_price)}</p>
        {path && (
          <a href={path} className="text-primary underline-offset-4 hover:underline">
            Ver página pública
          </a>
        )}
        {listing.code && <CorrectionForm providerId={listing.provider} listingCode={listing.code} />}
      </div>
    </li>
  );
}

function useLinkedListings(providerId: string, listingCode: string | null): LoadState {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    loadListings(providerId, listingCode, controller.signal)
      .then((listings) => setState({ status: "ready", listings }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "unavailable" });
        }
      });
    return () => controller.abort();
  }, [providerId, listingCode]);
  return state;
}

async function loadListings(providerId: string, listingCode: string | null, signal: AbortSignal): Promise<Listing[]> {
  if (listingCode !== null) {
    return [await fetchListing(providerId, listingCode, signal)];
  }
  const query = new URLSearchParams({ transaction: "rent", providers: providerId, limit: String(SOURCE_PAGE_SIZE) });
  const response = await searchListings(query.toString(), 1, signal);
  if (response.status === "error") {
    throw new Error("Source did not answer");
  }
  return response.results;
}
