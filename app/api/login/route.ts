import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mail, password } = body

    console.log("🔐 Intentando login para:", mail)

    const response = await fetch("https://api-parroquiasagradafamilia-s6qu.onrender.com/auth/login", {
      method: "POST",
      credentials: 'include',
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
        { error: errorData.message || errorData.error || "Error al iniciar sesión" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Respuesta del backend:", data)

    if (!data || !data.data || !data.data.role) {
      console.error("⚠️ Estructura de respuesta inesperada:", data)
      return NextResponse.json(
        { error: "Respuesta inválida del servidor" },
        { status: 500 }
      )
    }

    const backendCookies = response.headers.get('set-cookie')
    console.log("🍪 Cookies del backend:", backendCookies)

    const nextResponse = NextResponse.json({
      message: "Login exitoso",
      user: data.data, // 👈 Cambié esto para que coincida con tu componente de login
    }, { status: 200 })

    // 👇 CAMBIO IMPORTANTE: Usar "role" en lugar de "userRole"
    nextResponse.cookies.set("role", data.data.role, {
      httpOnly: true, // 👈 Se establece como true por seguridad; el middleware puede leerla igualmente.
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hora
      path: "/",
    })

    if (backendCookies) {
      const cookies = backendCookies.split(',').map(c => c.trim())
      cookies.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie)
      })
    }

    console.log("✅ Login exitoso, rol establecido:", data.data.role)

    return nextResponse

  } catch (error: any) {
    console.error("💥 Error en /api/login:", error)
    return NextResponse.json(
      { error: "Error del servidor: " + error.message },
      { status: 500 }
    )
  }
}