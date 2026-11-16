"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireAdvertiser, requireUser } from "@/auth/session";
import { database } from "@/db/prisma";
import { commerce } from "@/modules/advertiser-commerce/composition";
import { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";
import { ListingRef } from "@/modules/advertiser-commerce/domain/listing-ref";
import { failureFrom, type ActionResult } from "@/modules/advertiser-commerce/presentation/action-result";
import {
  ClaimSchema,
  ConsentSchema,
  CorrectionSchema,
  DecisionSchema,
  ProfileSchema,
} from "@/modules/advertiser-commerce/presentation/schemas";

const fields = (form: FormData) => Object.fromEntries(form.entries());

/** Creates the advertiser profile of the signed-in user. It grants access to no listing. */
export async function createProfile(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireUser();
  try {
    ConsentSchema.parse(fields(form));
    const profile = ProfileSchema.parse(fields(form));
    await database().advertiserProfile.upsert({
      where: { userId: user.id },
      create: { ...profile, userId: user.id, consentedAt: new Date() },
      update: profile,
    });
  } catch (error) {
    return failureFrom(error);
  }
  redirect("/painel");
}

export async function updateProfile(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const { advertiserId } = await requireAdvertiser();
  try {
    const profile = ProfileSchema.parse(fields(form));
    await database().advertiserProfile.update({ where: { id: advertiserId }, data: profile });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath("/painel", "layout");
  return { status: "done", message: "Perfil atualizado." };
}

export async function submitClaim(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const { user, advertiserId } = await requireAdvertiser();
  try {
    const input = ClaimSchema.parse(fields(form));
    const target =
      input.scope === "SOURCE" ? ClaimTarget.source(input.providerId) : ClaimTarget.listing(input.providerId, input.listingCode);
    await commerce().submitClaim.execute({ advertiserId, actorUserId: user.id, target, evidence: input.evidence });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath("/painel", "layout");
  return { status: "done", message: "Pedido enviado. Ele fica pendente até a análise da equipe." };
}

export async function decideClaim(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    const { claimId, decision, reason } = DecisionSchema.parse(fields(form));
    await commerce().decideClaim.execute({ claimId, actorUserId: admin.id, decision: { decision, reason } });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath("/admin", "layout");
  return { status: "done", message: "Decisão registrada." };
}

/** Files a correction request for review. The scraped listing itself is never edited. */
export async function reportCorrection(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const { advertiserId } = await requireAdvertiser();
  try {
    const input = CorrectionSchema.parse(fields(form));
    const ref = ListingRef.parse(input.providerId, input.listingCode);
    await commerce().listingAuthorization.assertAuthorized(advertiserId, ref);
    await database().correctionReport.create({ data: { advertiserId, ...ref.toPlain(), message: input.message } });
  } catch (error) {
    return failureFrom(error);
  }
  return { status: "done", message: "Recebemos seu aviso. A equipe vai revisar." };
}

export async function markCorrectionReviewed(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  await database().correctionReport.updateMany({ where: { id, status: "OPEN" }, data: { status: "REVIEWED" } });
  revalidatePath("/admin", "layout");
}
