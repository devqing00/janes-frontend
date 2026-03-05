import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? ""
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow /admin/login without auth
  if (pathname === "/admin/login") {
    const token = request.cookies.get("janes-admin-token")?.value;
    if (token && secret.length > 0) {
      try {
        await jwtVerify(token, secret);
        // Already authenticated — redirect to dashboard
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {
        // Invalid token — let them see login
      }
    }
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin")) {
    if (secret.length === 0) {
      // No secret configured — block access entirely
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const token = request.cookies.get("janes-admin-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // Token expired or invalid
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete("janes-admin-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
