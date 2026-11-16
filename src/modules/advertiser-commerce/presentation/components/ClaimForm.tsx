"use client";

import { useActionState, useState } from "react";
import { Field, FormMessage, Select, SubmitButton, Textarea } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IDLE } from "@/modules/advertiser-commerce/presentation/action-result";
import { submitClaim } from "@/modules/advertiser-commerce/presentation/actions";

interface ClaimFormProps {
  providerIds: string[];
  aggregatorProviderIds: readonly string[];
}

/** Asks to be linked to a whole source or to one listing. The request stays pending until reviewed. */
export function ClaimForm({ providerIds, aggregatorProviderIds }: ClaimFormProps) {
  const [result, formAction] = useActionState(submitClaim, IDLE);
  const [providerId, setProviderId] = useState(providerIds[0] ?? "");
  const [scope, setScope] = useState<"SOURCE" | "LISTING">("SOURCE");
  const listingOnly = aggregatorProviderIds.includes(providerId);
  const effectiveScope = listingOnly ? "LISTING" : scope;

  /** React clears the fields after a submission; bring the controlled selects back in step. */
  function resetSelections() {
    setProviderId(providerIds[0] ?? "");
    setScope("SOURCE");
  }

  return (
    <form action={formAction} onReset={resetSelections} className="grid gap-4">
      <Field label="Imobiliária ou portal de origem">
        <Select name="providerId" value={providerId} onChange={(event) => setProviderId(event.target.value)} required>
          {providerIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="O que você representa" hint={listingOnly ? "Este é um portal agregador: só aceita pedido por imóvel." : undefined}>
        <Select name="scope" value={effectiveScope} onChange={(event) => setScope(event.target.value as "SOURCE" | "LISTING")}>
          {!listingOnly && <option value="SOURCE">A imobiliária inteira (todos os imóveis dela)</option>}
          <option value="LISTING">Um imóvel específico</option>
        </Select>
      </Field>
      {effectiveScope === "LISTING" && (
        <Field label="Código do imóvel" hint="O código que aparece no endereço da página do imóvel neste portal.">
          <Input name="listingCode" required maxLength={100} className="h-10 font-normal" />
        </Field>
      )}
      {effectiveScope === "SOURCE" && <input type="hidden" name="listingCode" value="" />}
      <Field label="Comprovação" hint="Explique seu vínculo e como podemos confirmá-lo: e-mail do domínio oficial, página no site, contrato. Nome, telefone ou CRECI sozinhos não bastam.">
        <Textarea name="evidence" required minLength={20} maxLength={2000} />
      </Field>
      <FormMessage result={result} />
      <SubmitButton className="h-11 justify-self-start">Enviar pedido</SubmitButton>
    </form>
  );
}
