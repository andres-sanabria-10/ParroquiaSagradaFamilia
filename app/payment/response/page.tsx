// app/payment/response/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, XCircle, Loader2, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentResponsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'rejected' | 'pending' | 'failed'>('loading')
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [verifying, setVerifying] = useState(true)
  const [open, setOpen] = useState(true) // Control del modal

  useEffect(() => {
    const fetchPaymentStatusFromBackend = async () => {
      try {
        const internalInvoiceRef = searchParams.get('invoice')
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

        console.log('🔍 Consultando estado final del pago al backend para referencia:', internalInvoiceRef)
        const backendStatusResponse = await fetch(`/api/payment/status/${internalInvoiceRef}`, {
          method: 'GET',
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
          } else {
            setStatus('failed')
            toast.error('Pago fallido', {
              description: 'Ocurrió un error con tu pago. Por favor, revisa los detalles o intenta de nuevo.'
            })
          }

          setPaymentInfo({
            reference: backendPaymentData.payment.referenceCode,
            transactionId: backendPaymentData.payment.epaycoData?.transactionId || transaction_id_epayco || 'N/A',
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
  }, [searchParams])

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />,
          title: '¡Pago Exitoso!',
          message: 'Tu pago ha sido procesado correctamente. Tu solicitud será procesada pronto y recibirás el documento en tu correo.',
          color: 'text-green-600'
        }
      case 'rejected':
        return {
          icon: <XCircle className="h-20 w-20 text-red-500 mx-auto" />,
          title: 'Pago Rechazado',
          message: 'Tu pago no pudo ser procesado. Por favor, verifica los datos de tu tarjeta e intenta nuevamente.',
          color: 'text-red-600'
        }
      case 'pending':
        return {
          icon: <Clock className="h-20 w-20 text-yellow-500 mx-auto" />,
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo verificado. Te notificaremos por correo cuando sea confirmado.',
          color: 'text-yellow-600'
        }
      case 'failed':
        return {
          icon: <AlertCircle className="h-20 w-20 text-orange-500 mx-auto" />,
          title: 'Pago Fallido',
          message: 'Ocurrió un error al procesar tu pago. Por favor, intenta nuevamente más tarde.',
          color: 'text-orange-600'
        }
      default:
        return {
          icon: <Loader2 className="h-20 w-20 animate-spin text-primary mx-auto" />,
          title: 'Verificando...',
          message: 'Estamos verificando el estado de tu pago...',
          color: 'text-primary'
        }
    }
  }

  const config = getStatusConfig()

  const handleClose = () => {
    setOpen(false)
    // Pequeño delay para que la animación se complete antes de redirigir
    setTimeout(() => {
      router.push('/dashboard/feligres')
    }, 200)
  }

  const handleViewHistory = () => {
    setOpen(false)
    setTimeout(() => {
      router.push('/dashboard/feligres/historial')
    }, 200)
  }

  return (
    <>
      {/* Fondo oscuro mientras carga */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
      
      {/* Modal de resultado del pago */}
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden">
          {/* Header con ícono */}
          <div className="pt-8 pb-6">
            {config.icon}
          </div>

          {/* Título y descripción */}
          <DialogHeader className="space-y-3 px-6 pb-4">
            <DialogTitle className={`text-2xl font-bold text-center ${config.color}`}>
              {config.title}
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              {config.message}
            </DialogDescription>
          </DialogHeader>

          {/* Detalles del pago */}
          {paymentInfo && !verifying && (
            <div className="px-6 py-4 bg-muted/30">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Detalles de la transacción
                </h4>
                
                <div className="grid gap-2 text-sm">
                  {paymentInfo.reference && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Referencia:</span>
                      <span className="font-mono text-xs font-medium">{paymentInfo.reference}</span>
                    </div>
                  )}
                  
                  {paymentInfo.amount && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Monto:</span>
                      <span className="font-bold text-base">
                        ${parseInt(paymentInfo.amount || '0').toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  )}
                  
                  {paymentInfo.transactionId && paymentInfo.transactionId !== 'N/A' && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">ID Transacción:</span>
                      <span className="font-mono text-xs">{paymentInfo.transactionId}</span>
                    </div>
                  )}

                  {paymentInfo.message && paymentInfo.message !== 'N/A' && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className="text-xs font-medium">{paymentInfo.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {verifying && (
            <div className="px-6 py-8 flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verificando estado del pago...</p>
            </div>
          )}

          {/* Footer con botones */}
          {!verifying && (
            <DialogFooter className="px-6 py-4 bg-muted/20 sm:justify-between gap-2 flex-col sm:flex-row">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={handleViewHistory}
              >
                Ver Historial
              </Button>
              <Button 
                className="w-full sm:w-auto"
                onClick={handleClose}
              >
                Ir al Inicio
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}