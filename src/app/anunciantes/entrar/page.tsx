import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isGoogleSignInEnabled } from "@/auth/auth";
import { currentUser } from "@/auth/session";
import { SignInPanel } from "@/components/site/SignInPanel";

export const metadata: Metadata = { title: "Entrar" };

export default async function SignInPage() {
  const user = await currentUser();
  if (user) {
    redirect(user.isAdmin ? "/admin" : "/painel");
  }
  return (
    <main className="mx-auto grid w-full max-w-md gap-6 px-4 py-14">
      <header className="grid gap-2">
        <h1 className="text-3xl font-medium">Entrar</h1>
        <p className="text-sm text-muted-foreground">Área de imobiliárias e corretores.</p>
      </header>
      <SignInPanel googleEnabled={isGoogleSignInEnabled()} />
    </main>
  );
}
