import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/site/BrandMark";
import { SignOutButton } from "@/components/site/SignOutButton";

export interface AccountLink {
  href: string;
  label: string;
}

interface AccountShellProps {
  area: string;
  userName: string;
  links: AccountLink[];
  children: ReactNode;
}

/** Frame of the signed-in areas (advertiser panel and administration). */
export function AccountShell({ area, userName, links, children }: AccountShellProps) {
  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <BrandMark />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{userName}</span>
            <SignOutButton />
          </div>
        </div>
        <nav aria-label={area} className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-sm md:px-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 rounded-md px-3 py-2 hover:bg-muted">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto grid w-full max-w-6xl content-start gap-6 px-4 py-8 md:px-6">{children}</main>
    </>
  );
}

/** Titled white surface used by every panel section. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-medium">{title}</h2>
      {children}
    </section>
  );
}
