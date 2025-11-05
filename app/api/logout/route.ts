import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚪 Iniciando logout...")

    // Obtener las cookies del request
    const cookies = request.headers.get('cookie') || ''

    // Llamar al endpoint de logout del backend para limpiar la cookie JWT
    try {
      const backendResponse = await fetch("https://api-parroquiasagradafamilia-s6qu.onrender.com/auth/logout", {
        method: "POST",
        credentials: 'include',
        headers: {
          'Cookie': cookies,
        }
      })

      if (backendResponse.ok) {
        console.log("✅ Logout exitoso en el backend")
      } else {
        console.warn("⚠️ Error al hacer logout en el backend, pero continuando...")
      }
    } catch (backendError) {
      console.error("❌ Error conectando con el backend:", backendError)
      // Continuamos de todos modos para limpiar las cookies locales
    }

    // Crear respuesta de Next.js
    const res = NextResponse.json({ 
      message: "Logout exitoso",
      success: true 
    })
    
    // 👇 Limpiar la cookie 'role' manejada por Next.js
    res.cookies.set("role", "", { 
      path: "/", 
      maxAge: 0,
      httpOnly: false 
    })

    console.log("✅ Cookie 'role' eliminada")

    return res

  } catch (error) {
    console.error("💥 Error en logout:", error)
    
    // Aunque falle, limpiamos las cookies locales
    const res = NextResponse.json({ 
      message: "Logout exitoso (parcial)",
      success: false 
    }, { status: 500 })
    
    res.cookies.set("role", "", { 
      path: "/", 
      maxAge: 0 
    })
    
    return res
  }
}