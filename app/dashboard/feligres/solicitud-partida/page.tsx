// app/dashboard/feligres/solicitud-partida/page.tsx
"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Calendar, History, Church, Loader2, BookOpen, Heart, Cross } from "lucide-react"
import { useRouter } from "next/navigation"
import Script from "next/script"

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

// Declarar el tipo de ePayco para TypeScript
declare global {
  interface Window {
    ePayco: any;
  }
}

export default function SolicitudPartidaFeligres() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [epaycoLoaded, setEpaycoLoaded] = useState(false)
  const router = useRouter()

  // 🔥 Función para abrir el checkout de ePayco
  const openEpaycoCheckout = (epaycoData: any) => {
    console.log("💳 Abriendo checkout de ePayco con datos:", epaycoData)

    // Verificar que el script de ePayco esté cargado
    if (typeof window.ePayco === 'undefined') {
      console.error('❌ El script de ePayco no está cargado')
      toast.error('Error al cargar el sistema de pagos', {
        description: 'Por favor, recarga la página e intenta de nuevo.'
      })
      return
    }

    try {
      // Crear el handler de ePayco
      const handler = window.ePayco.checkout.configure({
        key: epaycoData.publicKey,
        test: epaycoData.test === 'true'
      })

      // Datos para el checkout
      const data = {
        // Información de la transacción
        name: epaycoData.description,
        description: epaycoData.description,
        invoice: epaycoData.invoice,
        currency: epaycoData.currency,
        amount: epaycoData.amount,
        tax_base: epaycoData.taxBase,
        tax: epaycoData.tax,
        country: epaycoData.country,
        lang: epaycoData.lang,
        
        // URLs de respuesta
        external: epaycoData.external === 'true',
        response: epaycoData.responseUrl,
        confirmation: epaycoData.confirmationUrl,
        
        // Información del comprador
        name_billing: epaycoData.nameFactura,
        address_billing: epaycoData.addressFactura,
        type_doc_billing: epaycoData.typeDocFactura,
        mobilephone_billing: epaycoData.mobilePhoneFactura,
        number_doc_billing: epaycoData.numberDocFactura,
        
        // Datos extras
        extra1: epaycoData.extra1,
        extra2: epaycoData.extra2,
        extra3: epaycoData.extra3,
        
        // Métodos de pago
        methodsDisable: epaycoData.methodsDisable ? JSON.parse(epaycoData.methodsDisable) : [],
      }

      console.log("✅ Abriendo checkout con configuración:", data)
      
      // Abrir el checkout
      handler.open(data)
      
    } catch (error) {
      console.error('❌ Error al abrir checkout de ePayco:', error)
      toast.error('Error al abrir la pasarela de pago', {
        description: 'Por favor, intenta de nuevo.'
      })
    }
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
        let error
        try {
          error = await paymentResponse.json()
        } catch (parseError) {
          const errorText = await paymentResponse.text()
          console.error("❌ Respuesta no-JSON del servidor:", errorText.substring(0, 200))
          throw new Error('Error del servidor al crear el pago. Por favor, intenta de nuevo.')
        }
        
        console.error("❌ Error al crear pago:", error)
        const errorMsg = error.error || error.details?.message || 'Error al crear el pago'
        throw new Error(errorMsg)
      }

      const paymentData = await paymentResponse.json()
      console.log('✅ Respuesta del pago:', paymentData)
      
      if (!paymentData.success || !paymentData.epaycoData) {
        throw new Error('No se recibieron los datos de pago')
      }

      // ━━━ PASO 3: Abrir checkout de ePayco ━━━
      console.log("🌐 Paso 3: Abriendo checkout de ePayco...")
      toast.success("Abriendo pasarela de pago...", {
        duration: 2000,
      })

      // ✅ Abrir el checkout usando el objeto ePayco
      setTimeout(() => {
        openEpaycoCheckout(paymentData.epaycoData)
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
    <>
      {/* 🔥 Cargar el script de ePayco */}
      <Script
        src="https://checkout.epayco.co/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("✅ Script de ePayco cargado")
          setEpaycoLoaded(true)
        }}
        onError={(e) => {
          console.error("❌ Error al cargar script de ePayco:", e)
          toast.error("Error al cargar el sistema de pagos")
        }}
      />

      <div className="flex h-screen bg-background">
        <Sidebar items={sidebarItems} userRole="feligrés" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Solicitud de Partidas</h1>
            <p className="text-muted-foreground">Selecciona el tipo de partida sacramental que deseas solicitar y procede con el pago.</p>
          </div>

          {!epaycoLoaded && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⏳ Cargando sistema de pagos...
              </p>
            </div>
          )}

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
                      disabled={isLoading || !epaycoLoaded}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : !epaycoLoaded ? (
                        "Cargando sistema de pagos..."
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
    </>
  )
}