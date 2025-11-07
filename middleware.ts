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

  // 🔹 Definir rutas de API públicas
  const publicApiPaths = [
    "/api/login",
    "/api/logout", 
    "/api/register", // Asume que tienes una ruta de registro
    "/api/test-backend" // Si tienes una para pruebas o salud del backend
  ]
  
  // Verificar si es una ruta de API (cualquiera que empiece por /api/)
  const isApiPath = pathname.startsWith("/api/")

  // 🔹 PRIMERO: Excluir rutas de API de autenticación explícitamente públicas
  // Si es una API pública, permitir acceso sin verificación de JWT.
  if (isApiPath && publicApiPaths.some(path => pathname.startsWith(path))) {
    console.log("✅ Ruta de API pública - Acceso permitido sin verificación")
    return NextResponse.next()
  }

  // 🔹 SEGUNDO: Manejo de rutas de API protegidas (el catch-all)
  // Si es una ruta de API (y no fue excluida por ser pública), entonces requiere JWT.
  if (isApiPath) {
    const jwt = request.cookies.get("jwt")?.value
    
    if (!jwt) {
      console.log("❌ API Protegida - JWT ausente, acceso denegado (401)")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Clonar la solicitud para modificar los headers de forma segura
    const newRequestHeaders = new Headers(request.headers)
    newRequestHeaders.set("Authorization", `Bearer ${jwt}`)

    // Devolver una nueva respuesta con la solicitud modificada
    // Esto hace que el JWT esté disponible como un header en la ruta API
    return NextResponse.next({
      request: {
        headers: newRequestHeaders,
      },
    })
  }

  // ⬆️ FIN DE LA SECCIÓN DE MANEJO DE APIs

  // 🔹 Obtener AMBAS cookies (para lógica de redirección de páginas)
  const dbRole = request.cookies.get("role")?.value?.toLowerCase()
  const jwt = request.cookies.get("jwt")?.value

  console.log("🍪 Role cookie (para páginas):", dbRole || "❌ ausente")
  console.log("🔑 JWT cookie (para páginas):", jwt ? "✅ presente" : "❌ ausente")

  // 🔹 Usuario está autenticado si tiene AMBAS cookies (para páginas)
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