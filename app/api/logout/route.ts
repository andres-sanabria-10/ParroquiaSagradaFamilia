import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚪 Iniciando logout...")

    // Obtener TODAS las cookies del request
    const cookies = request.headers.get('cookie') || ''
    console.log("🍪 Cookies recibidas:", cookies)

    // Llamar al endpoint de logout del backend
    try {
      const backendResponse = await fetch(
        "https://api-parroquiasagradafamilia-s6qu.onrender.com/auth/logout", 
        {
          method: "POST",
          credentials: 'include',
          headers: {
            'Cookie': cookies,
            'Content-Type': 'application/json'
          }
        }
      )

      if (backendResponse.ok) {
        console.log("✅ Logout exitoso en el backend")
      } else {
        console.warn("⚠️ Error al hacer logout en el backend:", await backendResponse.text())
      }
    } catch (backendError) {
      console.error("❌ Error conectando con el backend:", backendError)
    }

    // Crear respuesta
    const res = NextResponse.json({ 
      message: "Logout exitoso",
      success: true 
    })
    
    // 🔥 Limpiar TODAS las cookies de autenticación
    // Cookie del backend (JWT) - debe coincidir EXACTAMENTE con login
    res.cookies.delete("jwt")
    res.cookies.set("jwt", "", { 
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    })

    // Cookie del frontend (role) - debe coincidir EXACTAMENTE con login
    res.cookies.delete("role")
    res.cookies.set("role", "", { 
      path: "/", 
      maxAge: 0,
      httpOnly: true, // ⚠️ DEBE SER TRUE igual que en login
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    })

    console.log("✅ Todas las cookies eliminadas")
    return res

  } catch (error) {
    console.error("💥 Error en logout:", error)
    
    // Incluso si falla, limpiamos las cookies
    const res = NextResponse.json({ 
      message: "Error en logout, pero cookies limpiadas",
      success: true // ⬅️ Mantener true para que el frontend redirija
    }, { status: 200 }) // ⬅️ Cambiar a 200 en vez de 500
    
    res.cookies.set("jwt", "", { 
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    })
    
    res.cookies.set("role", "", { 
      path: "/", 
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    })
    
    return res
  }
}