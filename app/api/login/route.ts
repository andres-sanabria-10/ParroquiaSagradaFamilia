import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mail, password } = body || {}

    if (!mail || !password) {
      return NextResponse.json({ message: "Correo y contraseña son requeridos" }, { status: 400 })
    }

    const response = await fetch("https://api-parroquia.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail, password }),
    })

    if (!response.ok) {
      let message = "Error en autenticación"
      try {
        const errorData = await response.json()
        message = errorData?.message || message
      } catch {}
      return NextResponse.json({ message }, { status: response.status })
    }

    const data = await response.json()

    const token: string | undefined = data?.tokenSession
    const roleRaw: string | undefined = data?.data?.role

    if (!token || !roleRaw) {
      return NextResponse.json({ message: "Respuesta inválida del servidor" }, { status: 500 })
    }

    // Normalize backend roles to app roles
    const normalizedRole = (() => {
      const r = String(roleRaw).toLowerCase()
      if (r === "usuario") return "feligres"
      if (r === "admin") return "secretaria"
      if (r === "superadmin") return "parroco"
      if (["parroco", "secretaria", "feligres"].includes(r)) return r
      return "feligres"
    })()

    const res = NextResponse.json({ message: "ok", role: normalizedRole })

    // Set secure, httpOnly cookies
    const isProd = process.env.NODE_ENV === "production"
    res.cookies.set("tokenSession", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    res.cookies.set("role", normalizedRole, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 })
  }
}


