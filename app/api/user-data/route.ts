// app/api/user-data/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

export async function GET(request: NextRequest) {
  try {
    // Obtener el token JWT de las cookies
    const jwtToken = request.cookies.get('jwt')?.value
    
    console.log('🔐 API Route (User Data) - JWT Token:', jwtToken ? 'Found ✅' : 'Not found ❌')
    
    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No se encontró token de autenticación' },
        { status: 401 }
      )
    }

    // Hacer la petición al backend de Render
    const response = await fetch(`${API_URL}/user/data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `jwt=${jwtToken}`, // 👈 Pasar la cookie manualmente
      },
    })

    console.log('📡 API Route (User Data) - Backend response status:', response.status)

    // Obtener la respuesta del backend
    const responseData = await response.json()
    console.log('📋 API Route (User Data) - Backend response data:', responseData)
    
    if (!response.ok) {
      console.error('❌ API Route (User Data) - Backend error:', responseData)
      return NextResponse.json(responseData, { status: response.status })
    }

    console.log('✅ API Route (User Data) - Success!')
    return NextResponse.json(responseData, { status: 200 })
    
  } catch (error: any) {
    console.error('❌ API Route (User Data) - Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}