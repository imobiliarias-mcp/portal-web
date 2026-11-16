import { redirect } from "next/navigation";
import { requireUser } from "@/auth/session";
import { Section } from "@/components/site/AccountShell";
import { database } from "@/db/prisma";
import { createProfile } from "@/modules/advertiser-commerce/presentation/actions";
import { ProfileForm } from "@/modules/advertiser-commerce/presentation/components/ProfileForm";

export default async function OnboardingPage() {
  const user = await requireUser();
  const existing = await database().advertiserProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (existing) {
    redirect("/painel");
  }
  return (
    <Section title="Crie seu perfil de anunciante">
      <p className="text-sm text-muted-foreground">
        O perfil identifica você. Ele ainda não dá acesso a nenhum imóvel: isso depende de um pedido de vínculo aprovado.
      </p>
      <ProfileForm action={createProfile} askConsent submitLabel="Criar perfil" />
    </Section>
  );
}
