// app/payment/response/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentResponsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'rejected' | 'pending' | 'failed'>('loading')
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const fetchPaymentStatusFromBackend = async () => {
      try {
        // Obtener la referencia interna de la factura (invoice) que tu backend incluyó en la responseUrl
        const internalInvoiceRef = searchParams.get('invoice')

        // También capturamos la referencia de ePayco y el código de respuesta inicial,
        // aunque el estado final lo dará el backend.
        const ref_payco = searchParams.get('ref_payco') 
        const response_code_epayco = searchParams.get('x_cod_response')
        const transaction_id_epayco = searchParams.get('x_transaction_id')
        const amount_epayco = searchParams.get('x_amount')
        const response_message_epayco = searchParams.get('x_response')

        console.log('📨 Parámetros de ePayco en la URL (iniciales):', {
          internalInvoiceRef,
          ref_payco,
          response_code_epayco,
          transaction_id_epayco,
          amount_epayco,
          response_message_epayco
        })

        if (!internalInvoiceRef) {
          console.error('❌ No se encontró la referencia interna de la factura (invoice) en la URL.')
          setStatus('failed')
          setVerifying(false)
          toast.error('Error al procesar el pago', {
            description: 'No se pudo identificar la transacción. Por favor, revisa tu historial de pagos.'
          })
          return
        }

        // 🔍 Consultando estado final del pago al backend
        console.log('🔍 Consultando estado final del pago al backend para referencia:', internalInvoiceRef)
        const backendStatusResponse = await fetch(`/api/payment/status/${internalInvoiceRef}`, {
          method: 'GET', // Usamos GET para CONSULTAR el estado ya establecido por el webhook
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!backendStatusResponse.ok) {
          const errorData = await backendStatusResponse.json()
          console.error('❌ Error al consultar estado del pago con el backend:', errorData)
          toast.error('Error al verificar el estado de tu pago.', {
            description: 'Hubo un problema de comunicación. Por favor, consulta el historial o contacta a soporte.'
          })
          setStatus('failed')
          setVerifying(false)
          return
        }

        const backendPaymentData = await backendStatusResponse.json()
        console.log('✅ Estado del pago confirmado por backend:', backendPaymentData)

        if (backendPaymentData.success && backendPaymentData.payment) {
          const finalStatus = backendPaymentData.payment.status

          // Mapea el estado del backend a tu UI
          if (finalStatus === 'approved') {
            setStatus('success')
            toast.success('¡Pago confirmado!', {
              description: 'Tu solicitud será procesada pronto.'
            })
          } else if (finalStatus === 'pending') {
            setStatus('pending')
            toast.info('Pago pendiente', {
              description: 'Estamos verificando tu pago. Te notificaremos cuando sea confirmado.'
            })
          } else if (finalStatus === 'rejected') {
            setStatus('rejected')
            toast.error('Pago rechazado', {
              description: 'Tu pago no pudo ser procesado. Intenta nuevamente.'
            })
          } else { // 'failed' u otros estados no esperados
            setStatus('failed')
            toast.error('Pago fallido', {
              description: 'Ocurrió un error con tu pago. Por favor, revisa los detalles o intenta de nuevo.'
            })
          }

          // Rellenar la información del pago para mostrar en la UI
          setPaymentInfo({
            reference: backendPaymentData.payment.referenceCode, // Tu referencia interna
            transactionId: backendPaymentData.payment.epaycoData?.transactionId || transaction_id_epayco || 'N/A', // O la de ePayco si no está en tu DB
            amount: backendPaymentData.payment.amount,
            code: backendPaymentData.payment.epaycoData?.responseCode || response_code_epayco || 'N/A',
            message: backendPaymentData.payment.epaycoData?.responseMessage || response_message_epayco || 'N/A'
          })
        } else {
          console.warn('⚠️ El backend no devolvió datos de pago válidos o no encontró el pago.')
          setStatus('failed')
          toast.error('No se pudo encontrar el estado final de tu pago.', {
            description: 'Por favor, contacta a soporte si el problema persiste.'
          })
        }

      } catch (error) {
        console.error('❌ Error general procesando respuesta de pago:', error)
        setStatus('failed')
        toast.error('Error inesperado al procesar la respuesta de pago.', {
            description: 'Intenta consultar tu historial de pagos.'
        })
      } finally {
        setVerifying(false)
      }
    }

    fetchPaymentStatusFromBackend()
  }, [searchParams, router])

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: '¡Pago Exitoso!',
          message: 'Tu pago ha sido procesado correctamente. Tu solicitud será procesada pronto y recibirás el documento en tu correo.',
          color: 'border-green-500/20 bg-green-500/5'
        }
      case 'rejected':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: 'Pago Rechazado',
          message: 'Tu pago no pudo ser procesado. Por favor, verifica los datos de tu tarjeta e intenta nuevamente.',
          color: 'border-red-500/20 bg-red-500/5'
        }
      case 'pending':
        return {
          icon: <Clock className="h-16 w-16 text-yellow-500" />,
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo verificado. Te notificaremos por correo cuando sea confirmado.',
          color: 'border-yellow-500/20 bg-yellow-500/5'
        }
      case 'failed':
        return {
          icon: <AlertCircle className="h-16 w-16 text-orange-500" />,
          title: 'Pago Fallido',
          message: 'Ocurrió un error al procesar tu pago. Por favor, intenta nuevamente más tarde.',
          color: 'border-orange-500/20 bg-orange-500/5'
        }
      default:
        return {
          icon: <Loader2 className="h-16 w-16 animate-spin text-primary" />,
          title: 'Verificando...',
          message: 'Estamos verificando el estado de tu pago...',
          color: 'border-primary/20 bg-primary/5'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className={`w-full max-w-md border-2 ${config.color}`}>
        <CardHeader>
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <CardTitle className="text-2xl text-center">
            {config.title}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {config.message}
          </CardDescription>
        </CardHeader>
        
        {paymentInfo && !verifying && (
          <CardContent className="space-y-4">
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {paymentInfo.reference && (
                  <>
                    <span className="text-muted-foreground">Referencia Interna:</span>
                    <span className="font-mono text-xs break-all">{paymentInfo.reference}</span>
                  </>
                )}
                
                {paymentInfo.amount && (
                  <>
                    <span className="text-muted-foreground">Monto:</span>
                    <span className="font-semibold">
                      ${parseInt(paymentInfo.amount || '0').toLocaleString('es-CO')} COP
                    </span>
                  </>
                )}
                
                {paymentInfo.transactionId && (
                  <>
                    <span className="text-muted-foreground">Transacción ePayco:</span>
                    <span className="font-mono text-xs break-all">{paymentInfo.transactionId}</span>
                  </>
                )}
                {paymentInfo.message && (
                  <>
                    <span className="text-muted-foreground">Estado ePayco:</span>
                    <span className="text-xs">{paymentInfo.message}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/dashboard/feligres/historial')}
              >
                Ver Historial
              </Button>
              <Button 
                className="flex-1"
                onClick={() => router.push('/dashboard/feligres')}
              >
                Ir al Inicio
              </Button>
            </div>
          </CardContent>
        )}
        {verifying && (
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        )}
      </Card>
    </div>
  )
}