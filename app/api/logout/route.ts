import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Opcional: Llamar al endpoint de logout del backend
    await fetch("https://api-parroquia.onrender.com/auth/logout", {
      method: "POST",
      credentials: 'include',
    }).catch(() => {
      // Si falla, continuamos de todos modos
    })

    // Crear respuesta
    const res = NextResponse.json({ message: "Logout exitoso" })
    
    // Limpiar cookies de Next.js
    res.cookies.set("role", "", { 
      path: "/", 
      maxAge: 0,
      httpOnly: false 
    })

    // Limpiar la cookie JWT del backend (si la estás manejando desde Next.js)
    res.cookies.set("jwt", "", { 
      path: "/", 
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    })

    return res
  } catch (error) {
    console.error("Error en logout:", error)
    // Aunque falle, limpiamos las cookies
    const res = NextResponse.json({ message: "Logout exitoso" })
    res.cookies.set("role", "", { path: "/", maxAge: 0 })
    res.cookies.set("jwt", "", { path: "/", maxAge: 0 })
    return res
  }
}