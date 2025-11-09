// app/dashboard/feligres/solicitud-partida/page.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Calendar, History, Church, Loader2, BookOpen, Heart, Cross } from "lucide-react"
import { useRouter } from "next/navigation"

const sidebarItems = [
  {
    title: "Inicio",
    href: "/dashboard/feligres",
    icon: Church,
  },
  {
    title: "Solicitud de Partida",
    href: "/dashboard/feligres/solicitud-partida",
    icon: ClipboardList,
  },
  {
    title: "Solicitud de Misas",
    href: "/dashboard/feligres/solicitud-misas",
    icon: Calendar,
  },
  {
    title: "Historial",
    href: "/dashboard/feligres/historial",
    icon: History,
  },
]

const partidaTypes = [
  {
    title: "Bautismo",
    description: "Solicita una copia de tu partida de Bautismo.",
    type: "Baptism",
    icon: BookOpen,
    price: 50000,
  },
  {
    title: "Confirmación",
    description: "Solicita una copia de tu partida de Confirmación.",
    type: "Confirmation",
    icon: Cross,
    price: 50000,
  },
  {
    title: "Matrimonio",
    description: "Solicita una copia de tu partida de Matrimonio.",
    type: "Marriage",
    icon: Heart,
    price: 50000,
  },
]

export default function SolicitudPartidaFeligres() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // 🌐 Función para redirigir a ePayco (CON VALIDACIÓN)
  const redirectToEpayco = (checkoutData: any, checkoutUrl: string) => {
    console.log("🔍 Verificando datos antes de enviar a ePayco...")
    console.log("📋 CheckoutData completo:", JSON.stringify(checkoutData, null, 2))
    
    // ✅ Validar campos obligatorios
    const requiredFields = [
      'p_cust_id_cliente',
      'p_key',
      'p_amount',
      'p_amount_base',
      'p_tax',
      'p_currency_code',
      'p_signature',
      'p_reference',
      'p_description',
      'p_email',
      'p_name_billing',
      'p_address_billing',
      'p_type_doc_billing',
      'p_number_doc_billing',
      'p_url_response',
      'p_url_confirmation',
      'p_test_request'
    ]

    const missingFields: string[] = []
    requiredFields.forEach(field => {
      if (!checkoutData[field] || checkoutData[field] === '' || checkoutData[field] === 'undefined') {
        missingFields.push(field)
        console.error(`❌ Falta o es inválido el campo: ${field}`, checkoutData[field])
      } else {
        console.log(`✅ ${field}:`, checkoutData[field])
      }
    })

    if (missingFields.length > 0) {
      toast.error("Error en los datos de pago", {
        description: `Faltan campos: ${missingFields.join(', ')}`,
        duration: 5000,
      })
      console.error("🚨 Campos faltantes o inválidos:", missingFields)
      return
    }

    console.log("✅ Todos los campos obligatorios están presentes")
    console.log("🌐 Redirigiendo a:", checkoutUrl)

    // Crear un formulario dinámico
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = checkoutUrl
    form.target = '_self' // Asegurar que se abre en la misma ventana

    // Agregar todos los campos del checkoutData
    Object.keys(checkoutData).forEach(key => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = checkoutData[key]?.toString() || '' // Convertir a string por seguridad
      form.appendChild(input)
      console.log(`📝 Campo agregado: ${key} = ${input.value}`)
    })

    // Agregar el formulario al body y enviarlo
    document.body.appendChild(form)
    console.log("📤 Enviando formulario a ePayco...")
    form.submit()
  }

  // 🔥 Función principal: Crear solicitud + Iniciar pago
  const handleRequestDepartureWithPayment = async (departureType: string, price: number) => {
    console.log("🚀 Iniciando solicitud de partida con pago:", departureType)
  
    setLoadingStates((prev) => ({ ...prev, [departureType]: true }))
  
    try {
      // ━━━ PASO 1: Crear la solicitud de partida ━━━
      console.log("📝 Paso 1: Creando solicitud de partida...")
      const requestResponse = await fetch("/api/requestDeparture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ departureType }),
      })
  
      if (!requestResponse.ok) {
        const errorData = await requestResponse.json()
        
        if (requestResponse.status === 401) {
          toast.error("Sesión expirada", {
            description: "Por favor, inicia sesión de nuevo.",
          })
          router.push("/login")
          return
        }
  
        if (errorData.error?.includes("No se encontró una partida")) {
          throw new Error(`No tienes una partida de ${departureType.toLowerCase()} registrada en el sistema.`)
        }

        if (errorData.error?.includes("Ya tienes una solicitud pendiente")) {
          throw new Error(`Ya tienes una solicitud pendiente de ${departureType.toLowerCase()}.`)
        }
        
        throw new Error(errorData.error || "Error al crear la solicitud.")
      }
  
      const requestData = await requestResponse.json()
      console.log("✅ Solicitud creada:", requestData)

      const requestId = requestData._id

      toast.success("Solicitud creada", {
        description: "Ahora serás redirigido al pago...",
        duration: 2000,
      })

      // Esperar 1 segundo antes de continuar al pago
      await new Promise(resolve => setTimeout(resolve, 1000))

      // ━━━ PASO 2: Crear el pago ━━━
      console.log("💳 Paso 2: Creando pago...")
      console.log("📦 Datos del pago:", {
        serviceType: 'certificate',
        serviceId: requestId,
        amount: price,
        description: `Pago por certificado de ${departureType.toLowerCase()}`
      })

      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceType: 'certificate',
          serviceId: requestId,
          amount: price,
          description: `Pago por certificado de ${departureType.toLowerCase()}`
        })
      })

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json()
        console.error("❌ Error al crear pago:", error)
        throw new Error(error.error || 'Error al crear el pago')
      }

      const paymentData = await paymentResponse.json()
      console.log('✅ Respuesta completa del pago:', JSON.stringify(paymentData, null, 2))
      
      if (!paymentData.success) {
        throw new Error('No se pudo crear el pago')
      }

      // ✅ Verificar que checkoutData existe
      if (!paymentData.checkoutData) {
        console.error("❌ No se recibió checkoutData del backend")
        throw new Error('No se recibieron los datos del checkout')
      }

      // ━━━ PASO 3: Redirigir a ePayco ━━━
      console.log("🌐 Paso 3: Redirigiendo a ePayco...")
      toast.success("Redirigiendo a la pasarela de pago...", {
        duration: 2000,
      })

      // Redirigir a ePayco
      setTimeout(() => {
        redirectToEpayco(paymentData.checkoutData, paymentData.checkoutUrl)
      }, 500)

    } catch (error: any) {
      console.error("❌ Error en el proceso:", error)
      toast.error("Error en el proceso", {
        description: error.message,
        duration: 5000,
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [departureType]: false }))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="feligrés" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Solicitud de Partidas</h1>
          <p className="text-muted-foreground">Selecciona el tipo de partida sacramental que deseas solicitar y procede con el pago.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partidaTypes.map((partida) => {
            const isLoading = loadingStates[partida.type] || false
            return (
              <Card key={partida.type} className="flex flex-col">
                <CardHeader className="flex-row items-center gap-4">
                  <partida.icon className="h-10 w-10 text-primary" />
                  <div>
                    <CardTitle>{partida.title}</CardTitle>
                    <CardDescription>{partida.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <p>
                      Al solicitar, se buscará tu partida registrada en nuestro sistema y se generará una solicitud.
                    </p>
                  </div>
                  
                  {/* 💰 Mostrar precio */}
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium">Valor:</span>
                    <span className="text-lg font-bold text-primary">
                      ${partida.price.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleRequestDepartureWithPayment(partida.type, partida.price)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Solicitar y Pagar"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* 📋 Información adicional */}
        <Card className="mt-8 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">ℹ️ Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• El pago se realiza a través de ePayco de forma segura.</p>
            <p>• Una vez confirmado el pago, tu solicitud será procesada.</p>
            <p>• Recibirás el documento en tu correo electrónico registrado.</p>
            <p>• Puedes ver el estado de tus solicitudes en la sección "Historial".</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
