// app/payment/response/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, ArrowLeft, History, Home } from "lucide-react"

type PaymentStatus = 'loading' | 'approved' | 'rejected' | 'pending' | 'expired' | 'error' | 'not_found'

interface PaymentData {
  status: string
  amount: number
  referenceCode: string
  epaycoData?: {
    responseMessage?: string
    franchise?: string
    bank?: string
    authorization?: string
    responseCode?: string
  }
  confirmedAt?: string
  serviceType?: string
}

export default function PaymentResponsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('loading')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [pollingCount, setPollingCount] = useState(0)
  const [isPolling, setIsPolling] = useState(false)

  // Extraer referencia de la URL (puede venir como 'invoice' o 'x_id_invoice')
  const invoice = searchParams.get('invoice') || searchParams.get('x_id_invoice')
  
  // Otros parámetros que envía ePayco (solo para logs, NO para confiar en ellos)
  const x_cod_response = searchParams.get('x_cod_response')
  const x_response = searchParams.get('x_response')
  const ref_payco = searchParams.get('ref_payco')

  useEffect(() => {
    console.log("📋 Parámetros recibidos de ePayco:", {
      invoice,
      x_cod_response,
      x_response,
      ref_payco,
      allParams: Object.fromEntries(searchParams.entries())
    })

    if (!invoice) {
      console.error("❌ No se recibió referencia de pago (invoice)")
      setPaymentStatus('error')
      setErrorMessage("No se encontró la referencia del pago en la URL.")
      return
    }

    // Iniciar consulta del pago
    checkPaymentStatus(invoice)
  }, [invoice])

  // 🔄 Función para consultar el estado del pago
  const checkPaymentStatus = async (referenceCode: string, isPollingAttempt = false) => {
    try {
      if (!isPollingAttempt) {
        console.log("🔍 Consultando estado del pago:", referenceCode)
      } else {
        console.log("🔄 Polling intento:", pollingCount + 1)
      }

      const response = await fetch(`/api/payment/status/${referenceCode}`, {
        credentials: 'include'
      })

      if (response.status === 404) {
        setPaymentStatus('not_found')
        setErrorMessage("No se encontró el pago con esta referencia.")
        return
      }

      if (response.status === 401) {
        console.error("❌ No autorizado - redirigiendo a login")
        router.push('/login?redirect=/payment/response')
        return
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      console.log("✅ Respuesta del backend:", data)

      if (!data.success || !data.payment) {
        throw new Error("Respuesta inválida del servidor")
      }

      const payment = data.payment
      setPaymentData(payment)

      // Mapear el estado
      const status = payment.status.toLowerCase()
      
      if (status === 'approved') {
        setPaymentStatus('approved')
        setIsPolling(false)
        console.log("✅ Pago APROBADO")
      } else if (status === 'rejected' || status === 'failed') {
        setPaymentStatus('rejected')
        setIsPolling(false)
        console.log("❌ Pago RECHAZADO")
      } else if (status === 'expired') {
        setPaymentStatus('expired')
        setIsPolling(false)
        console.log("⏱️ Pago EXPIRADO")
      } else if (status === 'pending') {
        setPaymentStatus('pending')
        
        // Iniciar polling si no está activo y no hemos excedido intentos
        if (!isPolling && pollingCount < 40) { // Máximo 40 intentos = 2 minutos
          setIsPolling(true)
          setTimeout(() => {
            setPollingCount(prev => prev + 1)
            checkPaymentStatus(referenceCode, true)
          }, 3000) // Consultar cada 3 segundos
        } else if (pollingCount >= 40) {
          console.warn("⏰ Se alcanzó el límite de intentos de polling")
          setIsPolling(false)
        }
      } else {
        console.warn("⚠️ Estado desconocido:", status)
        setPaymentStatus('error')
        setErrorMessage(`Estado desconocido: ${status}`)
      }

    } catch (error: any) {
      console.error("💥 Error al consultar el pago:", error)
      setPaymentStatus('error')
      setErrorMessage(error.message || "Error al consultar el estado del pago.")
      setIsPolling(false)
    }
  }

  // 🎨 Función para renderizar el contenido según el estado
  const renderContent = () => {
    switch (paymentStatus) {
      case 'loading':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Consultando pago...</CardTitle>
              <CardDescription>
                Por favor espera mientras verificamos tu transacción
              </CardDescription>
            </CardHeader>
          </Card>
        )

      case 'approved':
        return (
          <Card className="w-full max-w-2xl mx-auto border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700 dark:text-green-400">
                ¡Pago Exitoso!
              </CardTitle>
              <CardDescription>
                Tu pago ha sido procesado correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Referencia:</span>
                  <span className="font-mono text-sm font-bold">{paymentData?.referenceCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Monto:</span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-400">
                    ${paymentData?.amount.toLocaleString('es-CO')} COP
                  </span>
                </div>
                {paymentData?.epaycoData?.franchise && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Franquicia:</span>
                    <span className="text-sm font-semibold">{paymentData.epaycoData.franchise}</span>
                  </div>
                )}
                {paymentData?.epaycoData?.authorization && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Autorización:</span>
                    <span className="font-mono text-sm">{paymentData.epaycoData.authorization}</span>
                  </div>
                )}
                {paymentData?.confirmedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Fecha:</span>
                    <span className="text-sm">
                      {new Date(paymentData.confirmedAt).toLocaleString('es-CO')}
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>✉️ Próximos pasos:</strong>
                  <br />
                  {paymentData?.serviceType === 'certificate' 
                    ? "Tu solicitud de certificado será procesada. Recibirás el documento en tu correo electrónico registrado."
                    : "Tu solicitud de misa ha sido confirmada. Recibirás un correo con los detalles."
                  }
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres')}
              >
                <Home className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres/historial')}
              >
                <History className="mr-2 h-4 w-4" />
                Ver Historial
              </Button>
            </CardFooter>
          </Card>
        )

      case 'rejected':
        return (
          <Card className="w-full max-w-2xl mx-auto border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700 dark:text-red-400">
                Pago Rechazado
              </CardTitle>
              <CardDescription>
                No se pudo procesar tu pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Referencia:</span>
                  <span className="font-mono text-sm">{paymentData?.referenceCode}</span>
                </div>
                {paymentData?.epaycoData?.responseMessage && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Motivo:</span>
                    <span className="text-sm text-red-700 dark:text-red-400 font-semibold">
                      {paymentData.epaycoData.responseMessage}
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>💡 Sugerencias:</strong>
                  <br />
                  • Verifica que tu tarjeta tenga fondos suficientes
                  <br />
                  • Asegúrate de ingresar correctamente los datos
                  <br />
                  • Intenta con otro método de pago
                  <br />
                  • Contacta a tu banco si el problema persiste
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres/solicitud-partida')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Intentar Nuevamente
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres')}
              >
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </CardFooter>
          </Card>
        )

      case 'pending':
        return (
          <Card className="w-full max-w-2xl mx-auto border-yellow-200 dark:border-yellow-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-8 w-8 text-yellow-600 animate-pulse" />
              </div>
              <CardTitle className="text-2xl text-yellow-700 dark:text-yellow-400">
                Pago Pendiente
              </CardTitle>
              <CardDescription>
                Tu pago está siendo procesado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Referencia:</span>
                  <span className="font-mono text-sm">{paymentData?.referenceCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Estado:</span>
                  <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900">
                    Procesando...
                  </Badge>
                </div>
              </div>

              {isPolling && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando automáticamente... ({pollingCount}/40)</span>
                </div>
              )}

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>ℹ️ Información:</strong>
                  <br />
                  Tu pago está siendo validado por la entidad bancaria. Esto puede tomar unos minutos.
                  <br />
                  <br />
                  Si el estado no cambia, puedes verificarlo más tarde en tu historial de pagos.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="w-full sm:w-auto"
                onClick={() => checkPaymentStatus(invoice!)}
                disabled={isPolling}
              >
                {isPolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "🔄 Verificar Ahora"
                )}
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres/historial')}
              >
                <History className="mr-2 h-4 w-4" />
                Ver Historial
              </Button>
            </CardFooter>
          </Card>
        )

      case 'expired':
        return (
          <Card className="w-full max-w-2xl mx-auto border-orange-200 dark:border-orange-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-orange-700 dark:text-orange-400">
                Pago Expirado
              </CardTitle>
              <CardDescription>
                El tiempo límite para completar el pago ha vencido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Referencia:</span>
                  <span className="font-mono text-sm">{paymentData?.referenceCode}</span>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 ¿Qué pasó?</strong>
                  <br />
                  Los pagos pendientes expiran después de 30 minutos de inactividad.
                  Puedes crear una nueva solicitud de pago para continuar.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres/solicitud-partida')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Crear Nuevo Pago
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres')}
              >
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </CardFooter>
          </Card>
        )

      case 'not_found':
      case 'error':
        return (
          <Card className="w-full max-w-2xl mx-auto border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700 dark:text-red-400">
                Error al Consultar Pago
              </CardTitle>
              <CardDescription>
                {errorMessage || "No se pudo obtener la información del pago"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>⚠️ Posibles causas:</strong>
                  <br />
                  • La referencia del pago no es válida
                  <br />
                  • El pago no está asociado a tu cuenta
                  <br />
                  • Hubo un problema de conexión
                  <br />
                  <br />
                  Si el problema persiste, contacta a soporte con la referencia: <strong>{invoice}</strong>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres/historial')}
              >
                <History className="mr-2 h-4 w-4" />
                Ver Historial
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard/feligres')}
              >
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </CardFooter>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {renderContent()}
      </div>
    </div>
  )
}