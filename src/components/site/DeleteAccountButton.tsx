"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/auth/auth-client";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);

  async function deleteAccount() {
    if (!window.confirm("Excluir sua conta e todos os seus dados? Não pode ser desfeito.")) {
      return;
    }
    const { error } = await authClient.deleteUser();
    if (error) {
      setFailure("Não foi possível excluir a conta. Entre novamente e tente de novo.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid gap-2 justify-items-start">
      <Button variant="outline" className="border-destructive text-destructive" onClick={deleteAccount}>
        Excluir minha conta
      </Button>
      {failure && (
        <p role="alert" className="text-sm text-destructive">
          {failure}
        </p>
      )}
    </div>
  );
}
