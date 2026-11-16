import Link from "next/link";
import { BrandMark } from "@/components/site/BrandMark";

/** Top bar shared by the public pages. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <BrandMark />
        <nav aria-label="Principal" className="flex items-center gap-1 text-sm">
          <Link href="/" className="hidden rounded-md px-3 py-2 hover:bg-muted sm:block">
            Buscar imóveis
          </Link>
          <Link href="/anunciantes" className="rounded-md border border-border bg-card px-3 py-2 font-medium hover:bg-muted">
            Sou imobiliária ou corretor
          </Link>
        </nav>
      </div>
    </header>
  );
}
