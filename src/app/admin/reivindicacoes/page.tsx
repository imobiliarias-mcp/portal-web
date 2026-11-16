import { requireAdmin } from "@/auth/session";
import { Section } from "@/components/site/AccountShell";
import { Button } from "@/components/ui/button";
import { database } from "@/db/prisma";
import { markCorrectionReviewed } from "@/modules/advertiser-commerce/presentation/actions";
import { ClaimStatusBadge } from "@/modules/advertiser-commerce/presentation/components/ClaimStatusBadge";
import { DecisionForm } from "@/modules/advertiser-commerce/presentation/components/DecisionForm";
import { ADVERTISER_TYPE_LABELS, claimTargetLabel, formatDate } from "@/modules/advertiser-commerce/presentation/labels";

const PAGE_SIZE = 100;

export default async function AdminClaimsPage() {
  await requireAdmin();
  const prisma = database();
  const [claims, corrections] = await Promise.all([
    prisma.claim.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      take: PAGE_SIZE,
      include: { advertiser: { include: { user: { select: { email: true } } } } },
    }),
    prisma.correctionReport.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
      take: PAGE_SIZE,
      include: { advertiser: { select: { displayName: true } } },
    }),
  ]);
  return (
    <>
      <h1 className="text-3xl font-medium">Pedidos de vínculo</h1>
      <Section title={`Pedidos (${claims.length})`}>
        {claims.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pedido.</p>}
        <ul className="grid gap-4">
          {claims.map((claim) => (
            <li key={claim.id} className="grid gap-3 rounded-xl border border-border p-4 text-sm md:grid-cols-[1fr_20rem]">
              <div className="grid content-start gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{claimTargetLabel(claim.providerId, claim.listingCode)}</span>
                  <ClaimStatusBadge status={claim.status} />
                </div>
                <span>
                  {claim.advertiser.displayName} ({ADVERTISER_TYPE_LABELS[claim.advertiser.type]}) · {claim.advertiser.user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  CRECI declarado: {claim.advertiser.creci ?? "não informado"} · enviado em {formatDate(claim.createdAt)}
                </span>
                <p className="whitespace-pre-line rounded-md bg-muted p-3">{claim.evidence}</p>
                {claim.decisionReason && <span className="text-muted-foreground">Motivo registrado: {claim.decisionReason}</span>}
              </div>
              <DecisionForm claimId={claim.id} status={claim.status} />
            </li>
          ))}
        </ul>
      </Section>
      <Section title={`Avisos de informação incorreta (${corrections.length})`}>
        {corrections.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aviso em aberto.</p>}
        <ul className="grid gap-3">
          {corrections.map((report) => (
            <li key={report.id} className="grid gap-2 rounded-xl border border-border p-4 text-sm">
              <span className="font-medium">
                {claimTargetLabel(report.providerId, report.listingCode)} · {report.advertiser.displayName}
              </span>
              <p className="whitespace-pre-line">{report.message}</p>
              <form action={markCorrectionReviewed}>
                <input type="hidden" name="id" value={report.id} />
                <Button type="submit" variant="outline">Marcar como revisado</Button>
              </form>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
