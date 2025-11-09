'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Clock, AlertCircle } from 'lucide-react'

export default function PaymentResponsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'rejected' | 'pending' | 'failed'>('loading')
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    // ePayco envía estos parámetros en la URL
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

    // Códigos de respuesta de ePayco:
    // 1 = Aprobada
    // 2 = Rechazada
    // 3 = Pendiente
    // 4 = Fallida

    if (response_code === '1') {
      setStatus('success')
    } else if (response_code === '2') {
      setStatus('rejected')
    } else if (response_code === '3') {
      setStatus('pending')
    } else if (response_code === '4') {
      setStatus('failed')
    } else {
      setStatus('failed')
    }

    setPaymentInfo({
      reference: ref_payco,
      transactionId: transaction_id,
      amount: amount,
      code: response_code,
      message: response_message
    })

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
        
        {paymentInfo && status !== 'loading' && (
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
      </Card>
    </div>
  )
}
