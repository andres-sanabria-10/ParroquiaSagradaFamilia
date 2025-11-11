// app/dashboard/feligres/solicitud-partida/page.tsx
"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Calendar, History, Church, Loader2, BookOpen, Heart, Cross, CheckCircle2 } from "lucide-react"
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
    price: 5000,
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

declare global {
  interface Window {
    ePayco: any;
  }
}

interface ExistingRequest {
  _id: string;
  status: string;
  departureType: string;
}

export default function SolicitudPartidaFeligres() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [checkingStates, setCheckingStates] = useState<Record<string, boolean>>({})
  const [existingRequests, setExistingRequests] = useState<Record<string, ExistingRequest | null>>({})
  const [epaycoLoaded, setEpaycoLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedPartida, setSelectedPartida] = useState<{ type: string; price: number; hasRequest: boolean; requestId?: string } | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  
  const router = useRouter()

  // 🔍 Verificar solicitudes existentes al cargar
  useEffect(() => {
    const checkAllRequests = async () => {
      for (const partida of partidaTypes) {
        await checkExistingRequest(partida.type)
      }
    }

    checkAllRequests()
  }, [])

  // 🔍 Función para verificar si existe una solicitud
  // ✅ CORREGIDO: Ya NO necesita userId porque viene del JWT
  const checkExistingRequest = async (departureType: string) => {
    setCheckingStates(prev => ({ ...prev, [departureType]: true }))

    try {
      console.log(`🔍 Verificando solicitud existente para ${departureType}...`)
      
      // ✅ RUTA CORREGIDA: Solo departureType, el userId viene del JWT
      const response = await fetch(
        `/api/requestdeparture/check/${departureType}`,
        {
          credentials: 'include' // Envía las cookies (JWT)
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ No autorizado - redirigiendo a login')
          router.push('/login')
          return
        }
        console.error(`❌ Error al verificar solicitud (${response.status}):`, await response.text())
        return
      }

      const data = await response.json()
      
      if (data.exists && data.request) {
        setExistingRequests(prev => ({
          ...prev,
          [departureType]: data.request
        }))
        console.log(`✅ Solicitud existente encontrada para ${departureType}:`, data.request)
      } else {
        setExistingRequests(prev => ({
          ...prev,
          [departureType]: null
        }))
        console.log(`ℹ️ No hay solicitud existente para ${departureType}`)
      }
    } catch (error) {
      console.error(`❌ Error al verificar solicitud de ${departureType}:`, error)
      toast.error('Error al verificar solicitudes', {
        description: 'No se pudo verificar si tienes solicitudes pendientes.'
      })
    } finally {
      setCheckingStates(prev => ({ ...prev, [departureType]: false }))
    }
  }

  // 🔥 Función para abrir el checkout de ePayco
  const openEpaycoCheckout = (epaycoData: any) => {
    console.log("💳 Abriendo checkout de ePayco con datos COMPLETOS:", JSON.stringify(epaycoData, null, 2))

    if (typeof window.ePayco === 'undefined') {
      console.error('❌ El script de ePayco no está cargado')
      toast.error('Error al cargar el sistema de pagos', {
        description: 'Por favor, recarga la página e intenta de nuevo.'
      })
      return
    }

    try {
      console.log("🔑 Configurando handler con publicKey:", epaycoData.publicKey)
      console.log("🧪 Modo test:", epaycoData.test)

      const handler = window.ePayco.checkout.configure({
        key: epaycoData.publicKey,
        test: epaycoData.test === 'true'
      })

      const data = {
        name: epaycoData.name || epaycoData.description,
        description: epaycoData.description,
        invoice: epaycoData.invoice,
        currency: epaycoData.currency,
        amount: epaycoData.amount,
        tax_base: epaycoData.taxBase || epaycoData.tax_base || '0',
        tax: epaycoData.tax || '0',
        
        country: epaycoData.country,
        lang: epaycoData.lang,
        
        external: epaycoData.external === 'true',
        response: epaycoData.responseUrl,
        confirmation: epaycoData.confirmationUrl,
        
        name_billing: epaycoData.name_billing,
        email_billing: epaycoData.email_billing,
        address_billing: epaycoData.address_billing,
        type_doc_billing: epaycoData.type_doc_billing,
        mobilephone_billing: epaycoData.mobilephone_billing,
        number_doc_billing: epaycoData.number_doc_billing,
        
        extra1: epaycoData.extra1,
        extra2: epaycoData.extra2,
        extra3: epaycoData.extra3,
        
        methodsDisable: epaycoData.methodsDisable ? JSON.parse(epaycoData.methodsDisable) : [],
      }

      console.log("✅ Datos preparados para checkout:", JSON.stringify(data, null, 2))
      console.log("🚀 Abriendo handler.open()...")
      handler.open(data)
      
    } catch (error) {
      console.error('❌ Error al abrir checkout de ePayco:', error)
      toast.error('Error al abrir la pasarela de pago', {
        description: 'Por favor, intenta de nuevo.'
      })
    }
  }

  // 🔍 Validar formulario
  const validateForm = () => {
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      toast.error("Teléfono inválido", {
        description: "El teléfono debe tener 10 dígitos numéricos."
      })
      return false
    }

    if (!address || address.trim().length < 10) {
      toast.error("Dirección inválida", {
        description: "La dirección debe tener al menos 10 caracteres."
      })
      return false
    }

    return true
  }

  // 🔥 Abrir modal con la información correcta
  const handleOpenModal = (type: string, price: number) => {
    const existingRequest = existingRequests[type]
    
    setSelectedPartida({ 
      type, 
      price,
      hasRequest: !!existingRequest,
      requestId: existingRequest?._id
    })
    setShowModal(true)
  }

  // 💳 SOLO PAGAR (cuando ya existe solicitud)
  const handlePaymentOnly = async () => {
    if (!selectedPartida || !selectedPartida.requestId) return

    if (!validateForm()) return

    const { type: departureType, price, requestId } = selectedPartida

    console.log("💳 Procesando solo pago para solicitud existente:", requestId)
  
    setLoadingStates((prev) => ({ ...prev, [departureType]: true }))
    setShowModal(false)
  
    try {
      // Crear el pago directamente
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceType: 'certificate',
          serviceId: requestId,
          amount: price,
          description: `Pago por certificado de ${departureType.toLowerCase()}`,
          phone: phoneNumber,
          address: address,
        })
      })

      if (!paymentResponse.ok) {
        let error
        try {
          error = await paymentResponse.json()
        } catch (parseError) {
          throw new Error('Error del servidor al crear el pago.')
        }
        
        const errorMsg = error.error || error.details?.message || 'Error al crear el pago'
        
        if (error.expiresIn) {
          throw new Error(`${errorMsg}. Expira en ${error.expiresIn} minutos.`)
        }
        
        throw new Error(errorMsg)
      }

      const paymentData = await paymentResponse.json()
      console.log('✅ Pago creado:', paymentData)
      
      if (!paymentData.success || !paymentData.epaycoData) {
        throw new Error('No se recibieron los datos de pago')
      }

      toast.success("Abriendo pasarela de pago...", {
        duration: 2000,
      })

      setTimeout(() => {
        openEpaycoCheckout(paymentData.epaycoData)
      }, 500)

    } catch (error: any) {
      console.error("❌ Error en el proceso de pago:", error)
      toast.error("Error al procesar el pago", {
        description: error.message,
        duration: 5000,
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [departureType]: false }))
    }
  }

  // 📝 SOLICITAR + PAGAR (cuando NO existe solicitud)
  const handleRequestAndPayment = async () => {
    if (!selectedPartida) return

    if (!validateForm()) return

    const { type: departureType, price } = selectedPartida

    console.log("🚀 Creando solicitud + pago:", departureType)
  
    setLoadingStates((prev) => ({ ...prev, [departureType]: true }))
    setShowModal(false)
  
    try {
      // PASO 1: Crear la solicitud
      console.log("📝 Paso 1: Creando solicitud de partida...")
      const requestResponse = await fetch("/api/requestDeparture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          await checkExistingRequest(departureType)
          throw new Error(`Ya tienes una solicitud pendiente. Usa el botón "Solo Pagar".`)
        }
        
        throw new Error(errorData.error || "Error al crear la solicitud.")
      }
  
      const requestData = await requestResponse.json()
      console.log("✅ Solicitud creada:", requestData)

      const requestId = requestData._id

      // Actualizar el estado de solicitudes existentes
      setExistingRequests(prev => ({
        ...prev,
        [departureType]: requestData
      }))

      toast.success("Solicitud creada", {
        description: "Ahora serás redirigido al pago...",
        duration: 2000,
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      // PASO 2: Crear el pago
      console.log("💳 Paso 2: Creando pago...")
      
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceType: 'certificate',
          serviceId: requestId,
          amount: price,
          description: `Pago por certificado de ${departureType.toLowerCase()}`,
          phone: phoneNumber,
          address: address,
        })
      })

      if (!paymentResponse.ok) {
        let error
        try {
          error = await paymentResponse.json()
        } catch (parseError) {
          throw new Error('Error del servidor al crear el pago.')
        }
        
        const errorMsg = error.error || error.details?.message || 'Error al crear el pago'
        throw new Error(errorMsg)
      }

      const paymentData = await paymentResponse.json()
      console.log('✅ Respuesta del pago:', paymentData)
      
      if (!paymentData.success || !paymentData.epaycoData) {
        throw new Error('No se recibieron los datos de pago')
      }

      // PASO 3: Abrir checkout
      console.log("🌐 Paso 3: Abriendo checkout de ePayco...")
      toast.success("Abriendo pasarela de pago...", {
        duration: 2000,
      })

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

      {/* 📱 Modal para completar datos */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPartida?.hasRequest ? 'Proceder con el Pago' : 'Completar Información'}
            </DialogTitle>
            <DialogDescription>
              {selectedPartida?.hasRequest 
                ? 'Ya tienes una solicitud pendiente. Completa tu información para proceder con el pago.'
                : 'Completa tu información de contacto para crear la solicitud y procesar el pago.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedPartida?.hasRequest && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Solicitud ya creada
                </span>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono Celular *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="3001234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                10 dígitos sin espacios ni guiones
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección Completa *</Label>
              <Input
                id="address"
                placeholder="Carrera 5 # 10-20, Sogamoso, Boyacá"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Incluye ciudad y departamento
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={selectedPartida?.hasRequest ? handlePaymentOnly : handleRequestAndPayment}
              disabled={!phoneNumber || !address || loadingStates[selectedPartida?.type || '']}
            >
              {loadingStates[selectedPartida?.type || ''] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : selectedPartida?.hasRequest ? (
                "Continuar al Pago"
              ) : (
                "Solicitar y Pagar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              const isChecking = checkingStates[partida.type] || false
              const existingRequest = existingRequests[partida.type]
              const hasRequest = !!existingRequest
              
              return (
                <Card key={partida.type} className="flex flex-col">
                  <CardHeader className="flex-row items-center gap-4">
                    <partida.icon className="h-10 w-10 text-primary" />
                    <div className="flex-1">
                      <CardTitle>{partida.title}</CardTitle>
                      <CardDescription>{partida.description}</CardDescription>
                    </div>
                    {hasRequest && (
                      <Badge variant="secondary" className="ml-auto">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Solicitada
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    {hasRequest ? (
                      <div className="text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                          ✅ Ya tienes una solicitud pendiente
                        </p>
                        <p className="text-xs">
                          Estado: <span className="font-semibold">{existingRequest.status}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        <p>
                          Al solicitar, se buscará tu partida registrada en nuestro sistema y se generará una solicitud.
                        </p>
                      </div>
                    )}
                    
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
                      variant={hasRequest ? "default" : "default"}
                      onClick={() => handleOpenModal(partida.type, partida.price)}
                      disabled={isLoading || !epaycoLoaded || isChecking}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : isChecking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : !epaycoLoaded ? (
                        "Cargando sistema de pagos..."
                      ) : hasRequest ? (
                        "💳 Solo Pagar"
                      ) : (
                        "📝 Solicitar y Pagar"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <Card className="mt-8 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Información Importante</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• El pago se realiza a través de ePayco de forma segura.</p>
              <p>• Los pagos pendientes expiran después de 30 minutos de inactividad.</p>
              <p>• Si ya tienes una solicitud creada, solo necesitas realizar el pago.</p>
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