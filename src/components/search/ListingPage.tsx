"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ApiError, fetchListing } from "@/catalog/api";
import type { Listing } from "@/catalog/types";
import { ListingDetails } from "@/components/search/ListingDialog";
import { Skeleton } from "@/components/ui/skeleton";

type LoadState = { status: "loading" } | { status: "ready"; listing: Listing } | { status: "failed"; message: string };

interface ListingPageProps {
  provider: string;
  code: string;
}

/** Standalone page of one listing, fetched live from the agency through the core. Key it by listing. */
export function ListingPage({ provider, code }: ListingPageProps) {
  const state = useListing(provider, code);
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-8 md:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        Voltar à busca
      </Link>
      <ListingBody state={state} />
    </main>
  );
}

function ListingBody({ state }: { state: LoadState }) {
  if (state.status === "loading") {
    return <Skeleton className="h-[32rem] w-full rounded-2xl" />;
  }
  if (state.status === "failed") {
    return (
      <p role="alert" className="rounded-2xl border border-border bg-card p-6 text-sm">
        {state.message}
      </p>
    );
  }
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <ListingDetails listing={state.listing} />
    </article>
  );
}

function useListing(provider: string, code: string): LoadState {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    fetchListing(provider, code, controller.signal)
      .then((listing) => setState({ status: "ready", listing }))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: "failed", message: describeFailure(cause) });
        }
      });
    return () => controller.abort();
  }, [provider, code]);
  return state;
}

function describeFailure(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 404) {
    return "Imobiliária desconhecida.";
  }
  return "Não foi possível carregar este imóvel agora. Ele pode ter saído do ar ou a imobiliária não respondeu.";
}
