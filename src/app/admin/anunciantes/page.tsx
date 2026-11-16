import { requireAdmin } from "@/auth/session";
import { Section } from "@/components/site/AccountShell";
import { database } from "@/db/prisma";
import { ADVERTISER_TYPE_LABELS, formatDate } from "@/modules/advertiser-commerce/presentation/labels";

const PAGE_SIZE = 200;

export default async function AdminAdvertisersPage() {
  await requireAdmin();
  const advertisers = await database().advertiserProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    include: { user: { select: { email: true } }, claims: { select: { status: true } } },
  });
  return (
    <>
      <h1 className="text-3xl font-medium">Anunciantes</h1>
      <Section title={`Perfis (${advertisers.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">Nome</th>
                <th className="py-2 pr-4 font-medium">Tipo</th>
                <th className="py-2 pr-4 font-medium">E-mail</th>
                <th className="py-2 pr-4 font-medium">Vínculos aprovados</th>
                <th className="py-2 font-medium">Desde</th>
              </tr>
            </thead>
            <tbody>
              {advertisers.map((advertiser) => (
                <tr key={advertiser.id} className="border-t border-border">
                  <td className="py-2 pr-4 font-medium">{advertiser.displayName}</td>
                  <td className="py-2 pr-4">{ADVERTISER_TYPE_LABELS[advertiser.type]}</td>
                  <td className="py-2 pr-4">{advertiser.user.email}</td>
                  <td className="py-2 pr-4">{advertiser.claims.filter((claim) => claim.status === "APPROVED").length}</td>
                  <td className="py-2">{formatDate(advertiser.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {advertisers.length === 0 && <p className="text-sm text-muted-foreground">Nenhum anunciante cadastrado.</p>}
      </Section>
    </>
  );
}
