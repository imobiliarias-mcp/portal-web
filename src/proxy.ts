import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_CORE_URL = "http://localhost:8000";

/**
 * Forwards the aggregator core's read-only API to the core service.
 * In production the reverse proxy routes these paths straight to the core,
 * so each visitor keeps their own rate-limit bucket; this is the dev/fallback path.
 */
export function proxy(request: NextRequest): NextResponse {
  const base = process.env.CENTRAL_MCP_API_URL ?? DEFAULT_CORE_URL;
  const target = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, base);
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: ["/api/providers", "/api/locations", "/api/facets", "/api/search", "/api/listings/:path*"],
};
