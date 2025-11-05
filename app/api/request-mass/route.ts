// app/api/request-mass/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

export async function POST(request: NextRequest) {
  try {
    // Obtener el token JWT de las cookies
    const jwtToken = request.cookies.get('jwt')?.value
    
    console.log('🔐 API Route - JWT Token:', jwtToken ? 'Found ✅' : 'Not found ❌')
    
    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No se encontró token de autenticación' },
        { status: 401 }
      )
    }

    // Obtener el body de la petición
    const body = await request.json()
    console.log('📦 API Route - Request body:', body)

    // Hacer la petición al backend de Render
    const response = await fetch(`${API_URL}/requestMass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `jwt=${jwtToken}`, // 👈 Pasar la cookie manualmente
      },
      body: JSON.stringify(body),
    })

    console.log('📡 API Route - Backend response status:', response.status)

    // Obtener la respuesta del backend
    const responseData = await response.json()
    console.log('📋 API Route - Backend response data:', responseData)
    
    if (!response.ok) {
      console.error('❌ API Route - Backend error:', responseData)
      return NextResponse.json(responseData, { status: response.status })
    }

    console.log('✅ API Route - Success!')
    return NextResponse.json(responseData, { status: 200 })
    
  } catch (error: any) {
    console.error('❌ API Route - Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}