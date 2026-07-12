import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/*
 * Next.js Edge Proxy checks only for the existence of the token cookie. 
 * We defer full signature decoding and role verification to the Route Handlers 
 * and Server Components to avoid bringing heavy, non-edge-compatible crypto libraries 
 * (like jsonwebtoken) into the Edge runtime environment.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Protect dashboard routes from unauthenticated users
  if (path.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
