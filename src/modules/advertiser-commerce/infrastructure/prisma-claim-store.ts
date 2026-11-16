import type { PrismaClient } from "@/generated/prisma/client";
import {
  ClaimChangedConcurrentlyError,
  type ClaimRecord,
  type ClaimStore,
  type NewClaim,
  type StatusChange,
} from "@/modules/advertiser-commerce/application/ports";
import { ClaimTarget } from "@/modules/advertiser-commerce/domain/claims/claim-target";

interface ClaimRow {
  id: string;
  advertiserId: string;
  providerId: string;
  listingCode: string | null;
  status: ClaimRecord["status"];
  evidence: string;
  decisionReason: string | null;
  createdAt: Date;
}

/** Claims in PostgreSQL. Each write and its audit entry share one transaction. */
export class PrismaClaimStore implements ClaimStore {
  constructor(private readonly prisma: PrismaClient) {}

  async hasOpenClaim(advertiserId: string, target: ClaimTarget): Promise<boolean> {
    const open = await this.prisma.claim.count({
      where: { advertiserId, ...target.toPlain(), status: { in: ["PENDING", "APPROVED"] } },
    });
    return open > 0;
  }

  async create(claim: NewClaim): Promise<ClaimRecord> {
    const data = { advertiserId: claim.advertiserId, evidence: claim.evidence, ...claim.target.toPlain() };
    const row = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.claim.create({ data });
      await transaction.claimAuditLog.create({
        data: { claimId: created.id, actorUserId: claim.actorUserId, toStatus: "PENDING" },
      });
      return created;
    });
    return toRecord(row);
  }

  async find(claimId: string): Promise<ClaimRecord | null> {
    const row = await this.prisma.claim.findUnique({ where: { id: claimId } });
    return row ? toRecord(row) : null;
  }

  async changeStatus(change: StatusChange): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const moved = await transaction.claim.updateMany({
        where: { id: change.claimId, status: change.from },
        data: { status: change.to, decisionReason: change.reason, decidedAt: new Date() },
      });
      if (moved.count !== 1) {
        throw new ClaimChangedConcurrentlyError(`Claim ${change.claimId} is no longer ${change.from}`);
      }
      await transaction.claimAuditLog.create({
        data: {
          claimId: change.claimId,
          actorUserId: change.actorUserId,
          fromStatus: change.from,
          toStatus: change.to,
          reason: change.reason,
        },
      });
    });
  }

  async approvedTargets(advertiserId: string): Promise<ClaimTarget[]> {
    const rows = await this.prisma.claim.findMany({
      where: { advertiserId, status: "APPROVED" },
      select: { providerId: true, listingCode: true },
    });
    return rows.map((row) => ClaimTarget.fromPlain(row.providerId, row.listingCode));
  }
}

function toRecord(row: ClaimRow): ClaimRecord {
  return {
    id: row.id,
    advertiserId: row.advertiserId,
    target: ClaimTarget.fromPlain(row.providerId, row.listingCode),
    status: row.status,
    evidence: row.evidence,
    decisionReason: row.decisionReason,
    createdAt: row.createdAt,
  };
}
