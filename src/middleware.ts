import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { getHomeRedirect } from "@/lib/post-auth-redirect";

const PUBLIC = [
  "/",
  "/login",
  "/register",
  "/masters",
  "/orders",
  "/how-it-works",
  "/categories",
];

function isPublic(pathname: string) {
  if (PUBLIC.includes(pathname)) return true;
  if (pathname.startsWith("/masters/")) return true;
  if (pathname.startsWith("/orders/") && !pathname.startsWith("/orders/new")) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/api/masters") && pathname === "/api/masters") return true;
  if (pathname.startsWith("/api/categories")) return true;
  if (pathname.startsWith("/api/public")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api/uploads")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getTokenFromRequest(req);
  const user = token ? await verifyToken(token) : null;

  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", req.url));
    if (user.role !== "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const needsAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/create-order") ||
    pathname.startsWith("/reviews");

  if (needsAuth && !user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && user) {
    return NextResponse.redirect(new URL(getHomeRedirect(user.role), req.url));
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL(getHomeRedirect(user.role), req.url));
  }

  if (pathname.startsWith("/api/") && !isPublic(pathname) && !user) {
    if (
      pathname.startsWith("/api/orders") ||
      pathname.startsWith("/api/conversations") ||
      pathname.startsWith("/api/reviews") ||
      pathname.startsWith("/api/favorites") ||
      pathname.startsWith("/api/notifications") ||
      pathname.startsWith("/api/reports") ||
      pathname.startsWith("/api/admin") ||
      pathname.startsWith("/api/me") ||
      pathname.startsWith("/api/upload")
    ) {
      return NextResponse.json({ error: "Ворид шавед" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
