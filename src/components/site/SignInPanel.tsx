"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const AFTER_SIGN_IN = "/anunciantes/entrar";

/** Google for advertisers; e-mail and password only for accounts the team created. */
export function SignInPanel({ googleEnabled }: { googleEnabled: boolean }) {
  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
      <GoogleSignIn enabled={googleEnabled} />
      <details className="border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-medium">Acesso da equipe (e-mail e senha)</summary>
        <PasswordSignIn />
      </details>
    </div>
  );
}

function GoogleSignIn({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return <p className="text-sm text-muted-foreground">O login com Google ainda não foi configurado nesta instalação.</p>;
  }
  return (
    <Button className="h-12" onClick={() => authClient.signIn.social({ provider: "google", callbackURL: AFTER_SIGN_IN })}>
      Continuar com Google
    </Button>
  );
}

function PasswordSignIn() {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setFailure(null);
    const { error } = await authClient.signIn.email({ email: String(form.get("email")), password: String(form.get("password")) });
    if (error) {
      setPending(false);
      setFailure("E-mail ou senha incorretos.");
      return;
    }
    router.push(AFTER_SIGN_IN);
    router.refresh();
  }

  return (
    <form onSubmit={signIn} className="mt-4 grid gap-4">
      <Field label="E-mail">
        <Input name="email" type="email" autoComplete="username" required className="h-10 font-normal" />
      </Field>
      <Field label="Senha">
        <Input name="password" type="password" autoComplete="current-password" required className="h-10 font-normal" />
      </Field>
      {failure && (
        <p role="alert" className="text-sm text-destructive">
          {failure}
        </p>
      )}
      <Button type="submit" variant="outline" disabled={pending} className="h-11">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
