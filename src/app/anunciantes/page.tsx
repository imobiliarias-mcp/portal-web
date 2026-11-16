import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, SearchCheck } from "lucide-react";

export const metadata: Metadata = { title: "Para imobiliárias e corretores" };

const STEPS = [
  { icon: Building2, title: "Crie seu perfil", text: "Entre com sua conta Google e identifique sua imobiliária ou sua atuação como corretor." },
  { icon: SearchCheck, title: "Peça o vínculo", text: "Indique a imobiliária ou o imóvel que você representa e como podemos confirmar." },
  { icon: BadgeCheck, title: "Seja verificado", text: "Nossa equipe analisa o pedido. Aprovado, seus imóveis aparecem no seu painel." },
];

export default function AdvertisersPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-14 md:px-6">
      <header className="grid gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Para anunciantes</p>
        <h1 className="max-w-3xl text-4xl font-medium leading-[1.05] md:text-5xl">Seus imóveis já estão aqui. Assuma o seu espaço.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Os anúncios vêm direto do site da sua imobiliária, sem cadastro manual. Comprove seu vínculo para acompanhar seus imóveis e, em breve, destacá-los na busca.
        </p>
        <Link href="/anunciantes/entrar" className="inline-flex h-12 items-center justify-self-start rounded-md bg-primary px-6 font-medium text-primary-foreground hover:opacity-90">
          Entrar ou criar conta
        </Link>
      </header>
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, position) => (
          <li key={step.title} className="grid content-start gap-3 rounded-2xl border border-border bg-card p-6">
            <step.icon aria-hidden className="size-6 text-primary" />
            <h2 className="text-xl font-medium">
              {position + 1}. {step.title}
            </h2>
            <p className="text-sm text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Você não cadastra nem edita imóveis aqui: as informações continuam vindo do site oficial. Se algo estiver errado, o painel permite avisar a equipe.
      </p>
    </main>
  );
}
