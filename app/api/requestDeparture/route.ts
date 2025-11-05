import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = cookies()
    const jwtToken = cookieStore.get('jwt')

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // 👇 Hacer la petición al backend con la cookie
    const response = await fetch("https://api-parroquiasagradafamilia-s6qu.onrender.com/requestDeparture/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `jwt=${jwtToken.value}`, // 👈 Enviar la cookie manualmente
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    console.error("Error en proxy:", error)
    return NextResponse.json(
      { error: "Error del servidor: " + error.message },
      { status: 500 }
    )
  }
}