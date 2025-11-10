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
    const verifyPayment = async () => {
      try {
        // Obtener parámetros de ePayco
        const ref_payco = searchParams.get('ref_payco')
        const response_code = searchParams.get('x_cod_response')
        const transaction_id = searchParams.get('x_transaction_id')
        const amount = searchParams.get('x_amount')
        const response_message = searchParams.get('x_response')

        console.log('📨 Respuesta de ePayco:', {
          ref_payco,
          response_code,
          transaction_id,
          amount,
          response_message
        })

        setPaymentInfo({
          reference: ref_payco,
          transactionId: transaction_id,
          amount: amount,
          code: response_code,
          message: response_message
        })

        // Determinar estado inicial
        let initialStatus: typeof status = 'failed'
        if (response_code === '1') {
          initialStatus = 'success'
        } else if (response_code === '2') {
          initialStatus = 'rejected'
        } else if (response_code === '3') {
          initialStatus = 'pending'
        } else if (response_code === '4') {
          initialStatus = 'failed'
        }

        setStatus(initialStatus)

        // 🔥 IMPORTANTE: Notificar al backend sobre el pago
        // Solo si tenemos la referencia de pago
        if (ref_payco) {
          try {
            console.log('🔔 Notificando al backend sobre el pago...')
            
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                ref_payco,
                transaction_id,
                response_code,
              })
            })

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json()
              console.log('✅ Verificación exitosa:', verifyData)
              
              // Actualizar estado basado en la verificación del backend
              if (verifyData.status === 'approved') {
                setStatus('success')
                toast.success('¡Pago confirmado!', {
                  description: 'Tu solicitud será procesada pronto.'
                })
              } else if (verifyData.status === 'pending') {
                setStatus('pending')
                toast.info('Pago pendiente', {
                  description: 'Estamos verificando tu pago.'
                })
              }
            } else {
              console.warn('⚠️ No se pudo verificar el pago con el backend')
            }
          } catch (verifyError) {
            console.error('❌ Error al verificar pago:', verifyError)
            // No cambiamos el status, dejamos el que ePayco nos dio
          }
        }

      } catch (error) {
        console.error('❌ Error procesando respuesta de pago:', error)
        setStatus('failed')
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams])

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
                    <span className="text-muted-foreground">Referencia:</span>
                    <span className="font-mono text-xs">{paymentInfo.reference}</span>
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
                    <span className="text-muted-foreground">Transacción:</span>
                    <span className="font-mono text-xs">{paymentInfo.transactionId}</span>
                  </>
                )}

                {paymentInfo.message && (
                  <>
                    <span className="text-muted-foreground">Estado:</span>
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