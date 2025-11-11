import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const roleMapping: Record<string, string> = {
  "super": "parroco",
  "admin": "secretaria",
  "usuario": "feligres",
}

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

  // 🔹 Rutas de API públicas (sin autenticación)
  const publicApiPaths = [
    "/api/login",
    "/api/logout", 
    "/api/register",
    "/api/test-backend",
    "/api/health"
  ]
  
  const isApiPath = pathname.startsWith("/api/")

  // ✅ PASO 1: Excluir rutas de API públicas
  if (isApiPath && publicApiPaths.some(path => pathname.startsWith(path))) {
    console.log("✅ Ruta de API pública - Acceso permitido sin verificación")
    return NextResponse.next()
  }

  // ✅ PASO 2: Manejo de rutas de API protegidas
  if (isApiPath) {
    const jwt = request.cookies.get("jwt")?.value
    
    if (!jwt) {
      console.log("❌ API Protegida - JWT ausente, acceso denegado (401)")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // ✅ Inyectar JWT como header Authorization
    const newRequestHeaders = new Headers(request.headers)
    newRequestHeaders.set("Authorization", `Bearer ${jwt}`)

    console.log("✅ JWT inyectado en header Authorization para API protegida")

    return NextResponse.next({
      request: {
        headers: newRequestHeaders,
      },
    })
  }

  // 🔹 Obtener cookies para lógica de páginas
  const dbRole = request.cookies.get("role")?.value?.toLowerCase()
  const jwt = request.cookies.get("jwt")?.value

  console.log("🍪 Role cookie:", dbRole || "❌ ausente")
  console.log("🔑 JWT cookie:", jwt ? "✅ presente" : "❌ ausente")

  const isAuthenticated = !!(dbRole && jwt)

  // 🔹 Rutas públicas (páginas)
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/about",
    "/forgot-password",
    "/verify-email",
    "/reset-password",
    "/payment/create",
    "/payment/response"
  ]
  
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // ✅ CASO 1: Usuario autenticado en rutas públicas → Redirigir a dashboard
  if (isPublicPath && isAuthenticated && pathname !== "/" && pathname !== "/payment/response") {
    console.log("✅ Usuario autenticado en ruta pública, redirigiendo a dashboard...")
    const mappedRole = roleMapping[dbRole] || dbRole
    const url = request.nextUrl.clone()
    url.pathname = `/dashboard/${mappedRole}`
    return NextResponse.redirect(url)
  }

  // ✅ CASO 2: Ruta pública → Permitir acceso
  if (isPublicPath) {
    console.log("🌐 Ruta pública - Acceso permitido")
    return NextResponse.next()
  }

  // ✅ CASO 3: Ruta protegida sin autenticación → Redirigir a login
  if (!isAuthenticated) {
    console.log("❌ No autenticado, redirigiendo a login")
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    
    const response = NextResponse.redirect(url)
    response.cookies.delete("role")
    response.cookies.delete("jwt")
    
    return response
  }

  // ✅ CASO 4: Usuario autenticado en ruta protegida → Verificar permisos
  const mappedRole = roleMapping[dbRole] || dbRole
  console.log("🔄 Mapped role:", dbRole, "→", mappedRole)

  const requiredRoles = getRequiredRoles(pathname)
  console.log("📋 Required roles for", pathname, ":", requiredRoles)
  
  if (requiredRoles && !requiredRoles.includes(mappedRole)) {
    console.log("⛔ Acceso denegado. Redirigiendo al dashboard correcto")
    
    const url = request.nextUrl.clone()
    url.pathname = `/dashboard/${mappedRole}`
    return NextResponse.redirect(url)
  }

  console.log("✅ Acceso permitido")
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
}