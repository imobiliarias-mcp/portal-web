import Link from "next/link";
import { requireAdvertiser } from "@/auth/session";
import { Section } from "@/components/site/AccountShell";
import { database } from "@/db/prisma";
import { ADVERTISER_TYPE_LABELS } from "@/modules/advertiser-commerce/presentation/labels";

export default async function PanelOverviewPage() {
  const { advertiserId } = await requireAdvertiser();
  const prisma = database();
  const [profile, approved, pending] = await Promise.all([
    prisma.advertiserProfile.findUniqueOrThrow({ where: { id: advertiserId } }),
    prisma.claim.count({ where: { advertiserId, status: "APPROVED" } }),
    prisma.claim.count({ where: { advertiserId, status: "PENDING" } }),
  ]);
  return (
    <>
      <header className="grid gap-1">
        <p className="text-sm text-muted-foreground">{ADVERTISER_TYPE_LABELS[profile.type]}</p>
        <h1 className="text-3xl font-medium">{profile.displayName}</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <Figure value={approved} label="vínculo(s) aprovado(s)" href="/painel/meus-imoveis" action="Ver meus imóveis" />
        <Figure value={pending} label="pedido(s) em análise" href="/painel/reivindicacoes" action="Acompanhar pedidos" />
      </div>
      {approved === 0 && (
        <Section title="Próximo passo">
          <p className="text-sm text-muted-foreground">
            Você ainda não tem vínculo verificado. Peça o vínculo com a sua imobiliária ou com um imóvel que você representa.
          </p>
          <Link href="/painel/reivindicacoes" className="inline-flex h-11 items-center justify-self-start rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90">
            Pedir vínculo
          </Link>
        </Section>
      )}
    </>
  );
}

function Figure({ value, label, href, action }: { value: number; label: string; href: string; action: string }) {
  return (
    <div className="grid gap-2 rounded-2xl border border-border bg-card p-6">
      <p className="font-display text-4xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <Link href={href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        {action}
      </Link>
    </div>
  );
}
