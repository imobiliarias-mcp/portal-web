"use client";

import Link from "next/link";
import { useBrand } from "@/brand/brand-context";

/** Footer with the data-origin notice and brand contact. */
export function SiteFooter() {
  const brand = useBrand();
  return (
    <footer className="mt-auto border-t border-border bg-muted/50">
      <div className="mx-auto grid max-w-7xl gap-2 px-4 py-8 text-sm text-muted-foreground md:px-6">
        <p>
          {brand.name} reúne anúncios publicados pelas próprias imobiliárias. Preços, fotos e disponibilidade são confirmados no site oficial de cada uma.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/anunciantes" className="underline-offset-4 hover:underline">
            Para imobiliárias e corretores
          </Link>
          {brand.supportEmail && (
            <a href={`mailto:${brand.supportEmail}`} className="underline-offset-4 hover:underline">
              {brand.supportEmail}
            </a>
          )}
        </p>
      </div>
    </footer>
  );
}
