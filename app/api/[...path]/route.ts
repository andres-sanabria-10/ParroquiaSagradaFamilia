import { NextRequest, NextResponse } from 'next/server'

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

async function handleRequest(
  request: NextRequest, 
  context: { params: Promise<{ path: string[] }> }  // 👈 params es una Promise
) {
  try {
    const { method } = request
    
    // 👇 AWAIT params antes de usarlo
    const params = await context.params
    const pathSegments = params.path.join('/')
    const targetBackendUrl = `${API_URL}/${pathSegments}`

    // El JWT ya fue inyectado por el middleware en el header Authorization
    const authorization = request.headers.get('Authorization')

    console.log(`📡 Proxying ${method} request to backend: ${targetBackendUrl}`)
    console.log('🔐 Authorization header:', authorization ? 'Present ✅' : 'Absent ❌')

    if (!authorization) {
      console.error('❌ Authorization header missing in protected API route.')
      return NextResponse.json(
        { error: 'Unauthorized: Missing Authorization header.' }, 
        { status: 401 }
      )
    }

    let requestBody = null
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        requestBody = await request.json()
        console.log('📦 Request body (proxy):', requestBody)
      } catch (parseError) {
        console.warn('⚠️ Could not parse request body as JSON for method:', method, parseError)
      }
    }

    const backendResponse = await fetch(targetBackendUrl, {
      method: method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Authorization': authorization,
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    })

    console.log('📡 Backend response status:', backendResponse.status)

    // 👇 Manejar respuestas no-JSON (HTML, texto plano, etc.)
    const contentType = backendResponse.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const responseData = await backendResponse.json()
      console.log('📋 Backend response data (proxy):', responseData)

      if (!backendResponse.ok) {
        console.error('❌ Backend error (proxy):', responseData)
        return NextResponse.json(responseData, { status: backendResponse.status })
      }

      console.log('✅ Proxy success!')
      return NextResponse.json(responseData, { status: backendResponse.status })
    } else {
      // Si no es JSON, devolver el texto tal cual
      const responseText = await backendResponse.text()
      console.log('📋 Backend response (non-JSON):', responseText.substring(0, 200))
      
      return new NextResponse(responseText, { 
        status: backendResponse.status,
        headers: { 'Content-Type': contentType || 'text/plain' }
      })
    }

  } catch (error: any) {
    console.error('💥 Error in catch-all API route:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { 
        error: 'Internal server error during proxy operation.',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    )
  }
}

// 👇 Actualizar las firmas de las funciones exportadas
export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context)
}

export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context)
}

export async function PUT(
  request: NextRequest, 
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context)
}

export async function PATCH(
  request: NextRequest, 
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context)
}

export async function DELETE(
  request: NextRequest, 
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context)
}