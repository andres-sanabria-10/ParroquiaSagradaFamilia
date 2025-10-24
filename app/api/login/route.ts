import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mail, password } = body

    console.log("🔐 Intentando login para:", mail)

    // Llamar al backend - SIN credentials porque estamos en el servidor
    const response = await fetch("https://api-parroquia.onrender.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mail, password }),
    })

    console.log("📡 Status del backend:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error del backend:", errorData)
      return NextResponse.json(
        { message: errorData.message || errorData.error || "Error al iniciar sesión" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Respuesta del backend:", data)

    // Verificar estructura de la respuesta
    if (!data || !data.data || !data.data.role) {
      console.error("⚠️ Estructura de respuesta inesperada:", data)
      return NextResponse.json(
        { message: "Respuesta inválida del servidor" },
        { status: 500 }
      )
    }

    // Extraer cookies del backend si existen
    const backendCookies = response.headers.get('set-cookie')
    console.log("🍪 Cookies del backend:", backendCookies)

    // Crear respuesta exitosa
    const nextResponse = NextResponse.json({
      message: "Login exitoso",
      role: data.data.role,
      user: data.data,
    }, { status: 200 })

    // Establecer cookie con el rol para navegación
    nextResponse.cookies.set("userRole", data.data.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hora
      path: "/",
    })

    // Si el backend envió cookies, reenviarlas
    if (backendCookies) {
      // Parsear y reenviar cada cookie
      const cookies = backendCookies.split(',').map(c => c.trim())
      cookies.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie)
      })
    }

    console.log("✅ Login exitoso, rol:", data.data.role)

    return nextResponse

  } catch (error: any) {
    console.error("💥 Error en /api/login:", error)
    return NextResponse.json(
      { message: "Error del servidor: " + error.message },
      { status: 500 }
    )
  }
}