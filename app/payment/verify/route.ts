// app/api/payment/verify/route.ts
"use client";
import { NextRequest, NextResponse } from 'next/server'

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ref_payco, transaction_id, response_code } = body

    console.log('🔍 Verificando pago:', { ref_payco, transaction_id, response_code })

    // Obtener JWT de las cookies
    const jwt = request.cookies.get('jwt')?.value

    if (!jwt) {
      console.error('❌ JWT ausente en verificación de pago')
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      )
    }

    // Llamar al endpoint de verificación del backend
    const backendResponse = await fetch(`${API_URL}/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        ref_payco,
        transaction_id,
        response_code,
      })
    })

    console.log('📡 Backend verification response status:', backendResponse.status)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      console.error('❌ Error del backend al verificar pago:', errorData)
      return NextResponse.json(
        errorData, 
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    console.log('✅ Verificación exitosa:', responseData)

    return NextResponse.json(responseData, { status: 200 })

  } catch (error: any) {
    console.error('💥 Error en verificación de pago:', error)
    return NextResponse.json(
      { 
        error: 'Error interno al verificar el pago',
        details: error.message 
      },
      { status: 500 }
    )
  }
}