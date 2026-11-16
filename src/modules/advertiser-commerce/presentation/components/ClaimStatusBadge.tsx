import { cn } from "@/lib/utils";
import type { ClaimStatus } from "@/modules/advertiser-commerce/domain/claims/claim-decision";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_TONES } from "@/modules/advertiser-commerce/presentation/labels";

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", CLAIM_STATUS_TONES[status])}>
      {CLAIM_STATUS_LABELS[status]}
    </span>
  );
}
