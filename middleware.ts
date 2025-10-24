import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Mapeo de roles: Base de datos → Frontend
const roleMapping: Record<string, string> = {
  "super": "parroco",      // Super del backend = Párroco en el frontend
  "admin": "secretaria",   // Admin del backend = Secretaria en el frontend
  "usuario": "feligres",   // Usuario del backend = Feligrés en el frontend
}

// Role-based access rules per path prefix
// Cada rol SOLO puede acceder a SU PROPIO dashboard
const roleRules: Record<string, string[]> = {
  "/dashboard/parroco": ["parroco"],        // Solo párroco
  "/dashboard/secretaria": ["secretaria"],  // Solo secretaria
  "/dashboard/feligres": ["feligres"],      // Solo feligrés
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
    pathname.startsWith("/api")
  ) {
    return NextResponse.next()
  }

  const dbRole = request.cookies.get("role")?.value?.toLowerCase()

  console.log("🔐 Middleware - Path:", pathname)
  console.log("🔐 Middleware - All Cookies:", request.cookies)
  console.log("🔐 Middleware - DB Role:", dbRole)

  // Require auth for non-public paths
  if (!dbRole) {
    console.log("❌ No role found, redirecting to login")
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Mapear el rol de la base de datos al rol del frontend
  const mappedRole = roleMapping[dbRole] || dbRole
  console.log("🔄 Mapped role:", dbRole, "→", mappedRole)

  const requiredRoles = getRequiredRoles(pathname)
  console.log("📋 Required roles for", pathname, ":", requiredRoles)
  
  if (requiredRoles && !requiredRoles.includes(mappedRole)) {
    console.log("⛔ Access denied. Redirecting to appropriate dashboard")
    
    // Redirigir al dashboard apropiado según el rol mapeado
    const url = request.nextUrl.clone()
    
    switch (mappedRole) {
      case "parroco":
        url.pathname = "/dashboard/parroco"
        break
      case "secretaria":
        url.pathname = "/dashboard/secretaria"
        break
      case "feligres":
        url.pathname = "/dashboard/feligres"
        break
      default:
        url.pathname = "/"
    }
    
    return NextResponse.redirect(url)
  }

  console.log("✅ Access granted")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)"],
}