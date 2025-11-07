import { NextRequest, NextResponse } from 'next/server'

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

async function handleRequest(request: NextRequest, params: { path: string[] }) {
  try {
    const { method } = request
    const pathSegments = params.path.join('/')
    const targetBackendUrl = `${API_URL}/${pathSegments}`

    // El JWT ya fue inyectado por el middleware en el header Authorization
    const authorization = request.headers.get('Authorization')

    console.log(`📡 Proxying ${method} request to backend: ${targetBackendUrl}`)
    console.log('🔐 Authorization header:', authorization ? 'Present ✅' : 'Absent ❌')

    if (!authorization) {
      // Esto no debería ocurrir si el middleware está funcionando correctamente
      console.error('❌ Authorization header missing in protected API route.')
      return NextResponse.json({ error: 'Unauthorized: Missing Authorization header.' }, { status: 401 })
    }

    let requestBody = null
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        requestBody = await request.json()
        console.log('📦 Request body (proxy):', requestBody)
      } catch (parseError) {
        console.warn('⚠️ Could not parse request body as JSON for method:', method, parseError)
        // No es crítico si el body no es JSON, por ejemplo, para algunas peticiones
      }
    }

    const backendResponse = await fetch(targetBackendUrl, {
      method: method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Authorization': authorization,
        // Otros headers que necesites reenviar
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    })

    console.log('📡 Backend response status:', backendResponse.status)

    const responseData = await backendResponse.json()
    console.log('📋 Backend response data (proxy):', responseData)

    if (!backendResponse.ok) {
      console.error('❌ Backend error (proxy):', responseData)
      return NextResponse.json(responseData, { status: backendResponse.status })
    }

    console.log('✅ Proxy success!')
    return NextResponse.json(responseData, { status: backendResponse.status })

  } catch (error: any) {
    console.error('💥 Error in catch-all API route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error during proxy operation.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params)
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params)
}

// Puedes añadir otros métodos HTTP si tu backend los usa:
// export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
//   return handleRequest(request, params)
// }

// export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
//   return handleRequest(request, params)
// }
