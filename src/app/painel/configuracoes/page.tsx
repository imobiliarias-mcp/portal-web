import { requireAdvertiser } from "@/auth/session";
import { Section } from "@/components/site/AccountShell";
import { DeleteAccountButton } from "@/components/site/DeleteAccountButton";
import { database } from "@/db/prisma";
import { updateProfile } from "@/modules/advertiser-commerce/presentation/actions";
import { ProfileForm } from "@/modules/advertiser-commerce/presentation/components/ProfileForm";

export default async function SettingsPage() {
  const { user, advertiserId } = await requireAdvertiser();
  const profile = await database().advertiserProfile.findUniqueOrThrow({ where: { id: advertiserId } });
  return (
    <>
      <h1 className="text-3xl font-medium">Configurações</h1>
      <Section title="Perfil">
        <p className="text-sm text-muted-foreground">Conta: {user.email}</p>
        <ProfileForm action={updateProfile} values={profile} askConsent={false} submitLabel="Salvar" />
      </Section>
      <Section title="Excluir conta">
        <p className="text-sm text-muted-foreground">
          Remove seu perfil, seus pedidos de vínculo e seus avisos. O histórico de decisões é mantido sem identificar você. Não pode ser desfeito.
        </p>
        <DeleteAccountButton />
      </Section>
    </>
  );
}
