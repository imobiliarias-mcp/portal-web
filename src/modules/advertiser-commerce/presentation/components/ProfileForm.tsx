"use client";

import { useActionState } from "react";
import { Field, FormMessage, Select, SubmitButton } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IDLE, type ActionResult } from "@/modules/advertiser-commerce/presentation/action-result";
import { ADVERTISER_TYPE_LABELS } from "@/modules/advertiser-commerce/presentation/labels";

export interface ProfileValues {
  type: keyof typeof ADVERTISER_TYPE_LABELS;
  displayName: string;
  creci: string | null;
  phone: string | null;
}

interface ProfileFormProps {
  action: (previous: ActionResult, form: FormData) => Promise<ActionResult>;
  values?: ProfileValues;
  /** Onboarding asks for consent; editing an existing profile does not ask again. */
  askConsent: boolean;
  submitLabel: string;
}

/** Advertiser identity. None of these fields proves a link to any listing. */
export function ProfileForm({ action, values, askConsent, submitLabel }: ProfileFormProps) {
  const [result, formAction] = useActionState(action, IDLE);
  return (
    <form action={formAction} className="grid gap-4">
      <Field label="Tipo de anunciante">
        <Select name="type" defaultValue={values?.type ?? "REAL_ESTATE_AGENCY"} required>
          {Object.entries(ADVERTISER_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Nome da imobiliária ou do corretor">
        <Input name="displayName" defaultValue={values?.displayName ?? ""} required maxLength={120} className="h-10 font-normal" />
      </Field>
      <Field label="CRECI (opcional)" hint="Apenas informativo. Não comprova vínculo com nenhum imóvel.">
        <Input name="creci" defaultValue={values?.creci ?? ""} maxLength={30} className="h-10 font-normal" />
      </Field>
      <Field label="Telefone (opcional)">
        <Input name="phone" type="tel" defaultValue={values?.phone ?? ""} maxLength={30} className="h-10 font-normal" />
      </Field>
      {askConsent && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consent" required className="mt-1 size-4" />
          <span>
            Concordo com o uso destes dados para identificar meu perfil de anunciante e analisar meus pedidos de vínculo. Posso excluir minha conta a qualquer momento.
          </span>
        </label>
      )}
      <FormMessage result={result} />
      <SubmitButton className="h-11 justify-self-start">{submitLabel}</SubmitButton>
    </form>
  );
}
