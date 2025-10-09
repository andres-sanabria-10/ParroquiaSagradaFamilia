import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Role-based access rules per path prefix
const roleRules: Record<string, string[]> = {
  "/dashboard/parroco": ["parroco", "admin", "superadmin"],
  "/dashboard/secretaria": ["secretaria", "admin", "superadmin"],
  "/dashboard/feligres": ["feligres", "admin", "superadmin"],
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const prefix of Object.keys(roleRules)) {
    if (pathname.startsWith(prefix)) return roleRules[prefix]
  }
  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/api") // API routes handle auth internally
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("tokenSession")?.value
  const role = request.cookies.get("role")?.value?.toLowerCase()

  // Require auth for non-public paths
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  const requiredRoles = getRequiredRoles(pathname)
  if (requiredRoles && (!role || !requiredRoles.includes(role))) {
    // Not authorized → send to home or own dashboard
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)"],
}


