"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ClaimStatus } from "@/modules/advertiser-commerce/domain/claims/claim-decision";
import { IDLE } from "@/modules/advertiser-commerce/presentation/action-result";
import { decideClaim } from "@/modules/advertiser-commerce/presentation/actions";

interface DecisionFormProps {
  claimId: string;
  status: ClaimStatus;
}

/** Administrator's decision on one claim. Rejecting and revoking need a reason. */
export function DecisionForm({ claimId, status }: DecisionFormProps) {
  const [result, formAction] = useActionState(decideClaim, IDLE);
  if (status !== "PENDING" && status !== "APPROVED") {
    return null;
  }
  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="claimId" value={claimId} />
      <Input name="reason" placeholder="Motivo (obrigatório para recusar ou revogar)" maxLength={500} aria-label="Motivo da decisão" />
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" && (
          <>
            <SubmitButton name="decision" value="approve">Aprovar</SubmitButton>
            <SubmitButton name="decision" value="reject" variant="outline">Recusar</SubmitButton>
          </>
        )}
        {status === "APPROVED" && (
          <SubmitButton name="decision" value="revoke" variant="outline">Revogar vínculo</SubmitButton>
        )}
      </div>
      <FormMessage result={result} />
    </form>
  );
}
