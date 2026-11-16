"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/auth/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <Button variant="outline" onClick={signOut}>
      Sair
    </Button>
  );
}
