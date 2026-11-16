import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .transform((value) => (value === "" ? null : value));

export const ProfileSchema = z.object({
  type: z.enum(["REAL_ESTATE_AGENCY", "INDEPENDENT_BROKER"], "Escolha o tipo de anunciante."),
  displayName: z.string().trim().min(2, "Informe o nome.").max(120, "Use no máximo 120 caracteres."),
  creci: optionalText(30),
  phone: optionalText(30),
});

export const ConsentSchema = z.object({
  consent: z.literal("on", "É preciso aceitar o tratamento dos dados para criar o perfil."),
});

export const ClaimSchema = z.object({
  scope: z.enum(["SOURCE", "LISTING"], "Escolha o tipo de pedido."),
  providerId: z.string().trim().min(1, "Escolha a imobiliária."),
  listingCode: z.string().trim(),
  evidence: z.string().trim(),
});

export const DecisionSchema = z.object({
  claimId: z.string().min(1),
  decision: z.enum(["approve", "reject", "revoke"]),
  reason: z.string().trim().max(500, "Use no máximo 500 caracteres."),
});

export const CorrectionSchema = z.object({
  providerId: z.string().trim().min(1),
  listingCode: z.string().trim().min(1),
  message: z.string().trim().min(10, "Descreva o problema com pelo menos 10 caracteres.").max(1000, "Use no máximo 1000 caracteres."),
});
