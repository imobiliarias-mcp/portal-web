import { z } from "zod";
import { ClaimNotFoundError } from "@/modules/advertiser-commerce/application/decide-claim";
import { ClaimChangedConcurrentlyError } from "@/modules/advertiser-commerce/application/ports";
import {
  DuplicateClaimError,
  InsufficientEvidenceError,
  UnknownClaimTargetError,
} from "@/modules/advertiser-commerce/application/submit-claim";
import { ListingNotAuthorizedError } from "@/modules/advertiser-commerce/domain/advertiser/advertiser-links";
import {
  InvalidClaimTransitionError,
  MissingDecisionReasonError,
} from "@/modules/advertiser-commerce/domain/claims/claim-decision";
import { AggregatorSourceNotClaimableError } from "@/modules/advertiser-commerce/domain/claims/source-policy";
import { InvalidListingRefError } from "@/modules/advertiser-commerce/domain/listing-ref";
import { CatalogUnavailableError } from "@/modules/advertiser-commerce/infrastructure/core-listing-catalog";

/** What a form receives back from a server action. */
export type ActionResult = { status: "idle" } | { status: "done"; message: string } | { status: "failed"; message: string };

export const IDLE: ActionResult = { status: "idle" };

type ErrorClass = new (...parameters: never[]) => Error;

const MESSAGES: Array<[ErrorClass, string]> = [
  [DuplicateClaimError, "Você já tem um pedido pendente ou aprovado para este alvo."],
  [InsufficientEvidenceError, "Descreva a comprovação com pelo menos 20 caracteres."],
  [UnknownClaimTargetError, "Não encontramos essa imobiliária ou esse imóvel no catálogo agora. Confira o código."],
  [AggregatorSourceNotClaimableError, "Portais agregadores só aceitam pedidos por imóvel, não pela fonte inteira."],
  [InvalidListingRefError, "Imobiliária ou código de imóvel inválido."],
  [ListingNotAuthorizedError, "Você não tem vínculo aprovado com este imóvel."],
  [CatalogUnavailableError, "O catálogo não respondeu. Tente de novo em instantes."],
  [ClaimNotFoundError, "Pedido não encontrado."],
  [InvalidClaimTransitionError, "Este pedido não está mais em um estado que permita essa decisão."],
  [MissingDecisionReasonError, "Informe o motivo da decisão."],
  [ClaimChangedConcurrentlyError, "O pedido foi alterado por outra pessoa. Recarregue a página."],
];

/** Turns a known domain error into a message for the form; anything else is rethrown. */
export function failureFrom(error: unknown): ActionResult {
  if (error instanceof z.ZodError) {
    return { status: "failed", message: error.issues[0]?.message ?? "Dados inválidos." };
  }
  const known = MESSAGES.find(([errorClass]) => error instanceof errorClass);
  if (!known) {
    throw error;
  }
  return { status: "failed", message: known[1] };
}
