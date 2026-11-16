import Link from "next/link";
import { requireAdvertiser } from "@/auth/session";
import { Section } from "@/components/site/AccountShell";
import { database } from "@/db/prisma";
import { LinkedListings } from "@/modules/advertiser-commerce/presentation/components/LinkedListings";
import { claimTargetLabel } from "@/modules/advertiser-commerce/presentation/labels";

export default async function MyListingsPage() {
  const { advertiserId } = await requireAdvertiser();
  const links = await database().claim.findMany({
    where: { advertiserId, status: "APPROVED" },
    orderBy: { createdAt: "asc" },
    select: { id: true, providerId: true, listingCode: true },
  });
  return (
    <>
      <h1 className="text-3xl font-medium">Meus imóveis</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        As informações abaixo vêm do site oficial e são somente leitura. Um imóvel ausente pode estar apenas indisponível no momento.
      </p>
      {links.length === 0 && (
        <Section title="Nenhum vínculo aprovado">
          <p className="text-sm text-muted-foreground">Seus imóveis aparecem aqui depois que um pedido de vínculo for aprovado.</p>
          <Link href="/painel/reivindicacoes" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Pedir vínculo
          </Link>
        </Section>
      )}
      {links.map((link) => (
        <Section key={link.id} title={claimTargetLabel(link.providerId, link.listingCode)}>
          <LinkedListings providerId={link.providerId} listingCode={link.listingCode} />
        </Section>
      ))}
    </>
  );
}
