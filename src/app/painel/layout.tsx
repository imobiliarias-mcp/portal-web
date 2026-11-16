import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { AccountShell } from "@/components/site/AccountShell";

export const metadata: Metadata = { title: "Painel do anunciante" };

const LINKS = [
  { href: "/painel", label: "Visão geral" },
  { href: "/painel/meus-imoveis", label: "Meus imóveis" },
  { href: "/painel/reivindicacoes", label: "Pedidos de vínculo" },
  { href: "/painel/configuracoes", label: "Configurações" },
];

export default async function PanelLayout({ children }: LayoutProps<"/painel">) {
  const user = await requireUser();
  if (user.isAdmin) {
    redirect("/admin");
  }
  return (
    <AccountShell area="Painel" userName={user.name} links={LINKS}>
      {children}
    </AccountShell>
  );
}
