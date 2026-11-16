import { database } from "@/db/prisma";

export const dynamic = "force-dynamic";

/** Liveness and readiness: the server answers and the database accepts a query. */
export async function GET(): Promise<Response> {
  try {
    await database().$queryRaw`SELECT 1`;
  } catch {
    return Response.json({ status: "database unavailable" }, { status: 503 });
  }
  return Response.json({ status: "healthy" });
}
