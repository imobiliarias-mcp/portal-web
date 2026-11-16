import type { Metadata } from "next";
import { requireAdmin } from "@/auth/session";
import { AccountShell } from "@/components/site/AccountShell";

export const metadata: Metadata = { title: "Administração" };

const LINKS = [
  { href: "/admin/reivindicacoes", label: "Pedidos de vínculo" },
  { href: "/admin/anunciantes", label: "Anunciantes" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <AccountShell area="Administração" userName={admin.name} links={LINKS}>
      {children}
    </AccountShell>
  );
}
