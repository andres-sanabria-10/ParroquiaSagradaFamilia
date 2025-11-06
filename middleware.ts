import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Mapeo de roles: Base de datos → Frontend
const roleMapping: Record<string, string> = {
  "super": "parroco",
  "admin": "secretaria",
  "usuario": "feligres",
}

// Role-based access rules per path prefix
const roleRules: Record<string, string[]> = {
  "/dashboard/parroco": ["parroco"],
  "/dashboard/secretaria": ["secretaria"],
  "/dashboard/feligres": ["feligres"],
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const prefix of Object.keys(roleRules)) {
    if (pathname.startsWith(prefix)) return roleRules[prefix]
  }
  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("🔐 Middleware ejecutándose en:", pathname)

  // 🔹 PRIMERO: Excluir rutas de API de autenticación (CRÍTICO)
  const publicApiPaths = [
    "/api/login",
    "/api/logout", 
    "/api/register",
    "/api/test-backend"
  ]
  
  if (publicApiPaths.some(path => pathname.startsWith(path))) {
    console.log("✅ Ruta de API pública - Acceso permitido sin verificación")
    return NextResponse.next()
  }

  // 🔹 Obtener AMBAS cookies
  const dbRole = request.cookies.get("role")?.value?.toLowerCase()
  const jwt = request.cookies.get("jwt")?.value

  console.log("🍪 Role cookie:", dbRole || "❌ ausente")
  console.log("🔑 JWT cookie:", jwt ? "✅ presente" : "❌ ausente")

  // 🔹 Usuario está autenticado si tiene AMBAS cookies
  const isAuthenticated = !!(dbRole && jwt)

  // 🔹 Rutas públicas (páginas, no APIs)
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/about",
    "/forgot-password",
    "/verify-email",
    "/reset-password"
  ]
  
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // 🔹 CASO 1: Usuario autenticado intenta acceder a rutas públicas (login, register)
  // → Redirigir a su dashboard
  if (isPublicPath && isAuthenticated && pathname !== "/") {
    console.log("✅ Usuario autenticado en ruta pública, redirigiendo a dashboard...")
    const mappedRole = roleMapping[dbRole] || dbRole
    const url = request.nextUrl.clone()
    url.pathname = `/dashboard/${mappedRole}`
    return NextResponse.redirect(url)
  }

  // 🔹 CASO 2: Ruta pública sin autenticación
  // → Permitir acceso
  if (isPublicPath) {
    console.log("🌐 Ruta pública - Acceso permitido")
    return NextResponse.next()
  }

  // 🔹 CASO 3: Ruta protegida SIN autenticación
  // → Redirigir a login
  if (!isAuthenticated) {
    console.log("❌ No autenticado, redirigiendo a login")
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    
    // Crear respuesta con redirección
    const response = NextResponse.redirect(url)
    
    // Limpiar cookies por seguridad
    response.cookies.delete("role")
    response.cookies.delete("jwt")
    
    return response
  }

  // 🔹 CASO 4: Usuario autenticado en ruta protegida
  // → Verificar permisos de rol
  const mappedRole = roleMapping[dbRole] || dbRole
  console.log("🔄 Mapped role:", dbRole, "→", mappedRole)

  const requiredRoles = getRequiredRoles(pathname)
  console.log("📋 Required roles for", pathname, ":", requiredRoles)
  
  if (requiredRoles && !requiredRoles.includes(mappedRole)) {
    console.log("⛔ Acceso denegado. Redirigiendo al dashboard correcto")
    
    // Redirigir al dashboard apropiado según el rol
    const url = request.nextUrl.clone()
    url.pathname = `/dashboard/${mappedRole}`
    return NextResponse.redirect(url)
  }

  console.log("✅ Acceso permitido")
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - archivos públicos (png, jpg, svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
}