"use client";

import { useBrand } from "@/brand/brand-context";

/** Headline of the search page, worded from the deployment's brand. */
export function SearchHero() {
  const brand = useBrand();
  return (
    <header className="grid gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{brand.regionLabel}</p>
      <h1 className="max-w-3xl text-4xl font-medium leading-[1.05] md:text-5xl">Encontre onde morar, sem abrir dez sites.</h1>
      <p className="max-w-2xl text-base text-muted-foreground">{brand.tagline}</p>
    </header>
  );
}
