"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton, Textarea } from "@/components/ui/form";
import { IDLE } from "@/modules/advertiser-commerce/presentation/action-result";
import { reportCorrection } from "@/modules/advertiser-commerce/presentation/actions";

interface CorrectionFormProps {
  providerId: string;
  listingCode: string;
}

/** Tells the team that scraped data is wrong. It never changes the listing. */
export function CorrectionForm({ providerId, listingCode }: CorrectionFormProps) {
  const [result, formAction] = useActionState(reportCorrection, IDLE);
  return (
    <details className="mt-1">
      <summary className="cursor-pointer text-muted-foreground">Reportar informação incorreta</summary>
      <form action={formAction} className="mt-2 grid gap-2">
        <input type="hidden" name="providerId" value={providerId} />
        <input type="hidden" name="listingCode" value={listingCode} />
        <Textarea name="message" required minLength={10} maxLength={1000} aria-label="O que está incorreto" className="min-h-20" />
        <FormMessage result={result} />
        <SubmitButton variant="outline" className="justify-self-start">Enviar aviso</SubmitButton>
      </form>
    </details>
  );
}
