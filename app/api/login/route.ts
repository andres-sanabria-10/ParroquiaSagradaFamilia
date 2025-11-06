import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mail, password } = body

    console.log("🔍 Intentando login para:", mail)

    const response = await fetch("https://api-parroquiasagradafamilia-s6qu.onrender.com/auth/login", {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mail, password }),
    })

    console.log("📡 Status del backend:", response.status)
    console.log("📡 Content-Type:", response.headers.get('content-type'))

    // 🔍 Verificar si la respuesta es HTML (error del servidor)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text()
      console.error("❌ Backend devolvió HTML en lugar de JSON:", htmlText.substring(0, 200))
      return NextResponse.json(
        { error: "Error del servidor backend - no responde correctamente" },
        { status: 500 }
      )
    }

    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch (parseError) {
        const text = await response.text()
        console.error("❌ Error parseando respuesta del backend:", text.substring(0, 200))
        return NextResponse.json(
          { error: "Error de comunicación con el servidor" },
          { status: response.status }
        )
      }
      console.error("❌ Error del backend:", errorData)
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Error al iniciar sesión" },
        { status: response.status }
      )
    }

    let data: any
    try {
      data = await response.json()
      console.log("✅ Respuesta del backend:", data)
    } catch (parseError) {
      const text = await response.text()
      console.error("❌ Error parseando JSON exitoso:", text.substring(0, 200))
      return NextResponse.json(
        { error: "Respuesta inválida del servidor" },
        { status: 500 }
      )
    }

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
      user: data.data,
    }, { status: 200 })

    // 🔥 CRÍTICO: La cookie 'role' debe tener httpOnly: true
    // Para que el middleware pueda leerla correctamente
    nextResponse.cookies.set("role", data.data.role, {
      httpOnly: true, // 🚨 DEBE SER TRUE - el middleware lee cookies httpOnly
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hora
      path: "/",
    })

    // Copiar las cookies del backend (incluyendo JWT)
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