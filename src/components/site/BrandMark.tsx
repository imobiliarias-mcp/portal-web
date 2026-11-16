"use client";

import Link from "next/link";
import { useBrand } from "@/brand/brand-context";

/** Logo (when configured) and name of the deployment's brand, linking home. */
export function BrandMark() {
  const brand = useBrand();
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${brand.name}, página inicial`}>
      <BrandLogo logoUrl={brand.logoUrl} initial={brand.shortName.charAt(0)} />
      <span className="font-display text-lg font-semibold leading-none">{brand.name}</span>
    </Link>
  );
}

function BrandLogo({ logoUrl, initial }: { logoUrl: string | undefined; initial: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className="h-8 w-auto" />;
  }
  return (
    <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground">
      {initial}
    </span>
  );
}
