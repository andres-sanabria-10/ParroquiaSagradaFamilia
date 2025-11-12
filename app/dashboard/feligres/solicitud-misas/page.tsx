'use client'

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ClipboardList, Calendar as CalendarIcon, Church, History, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import Script from "next/script"
import { useRouter } from "next/navigation"

// --- Sidebar ---
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
    icon: CalendarIcon,
  },
  {
    title: "Historial",
    href: "/dashboard/feligres/historial",
    icon: History,
  },
]

// --- Constantes ---
const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"
const MASS_PRICE = 5000 // Precio de la misa en COP

interface TimeSlot {
  time: string
  available: boolean
}

declare global {
  interface Window {
    ePayco: any;
  }
}

export default function SolicitudMisasFeligres() {
  const router = useRouter()
  
  // Estados del calendario y horarios
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDays, setAvailableDays] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [intention, setIntention] = useState("")
  
  // Estados del proceso de pago
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null)
  const [epaycoLoaded, setEpaycoLoaded] = useState(false)

  // Formateador de fecha a YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    return format(date, "yyyy-MM-dd")
  }

  // --- 1. Cargar días disponibles del mes ---
  const fetchAvailableDays = async (month: Date) => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const daysInMonth = eachDayOfInterval({ start, end })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const promises = daysInMonth
      .filter(day => day >= today)
      .map(day => {
        const dateString = formatDateForAPI(day)
        return fetch(`${API_URL}/massSchedule/time-slots?date=${dateString}`, {
          credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            if (data.timeSlots && data.timeSlots.some((slot: TimeSlot) => slot.available)) {
              return day
            }
            return null
          })
          .catch(() => null)
      })

    const results = (await Promise.all(promises)).filter(d => d !== null) as Date[]
    setAvailableDays(results)
  }

  useEffect(() => {
    fetchAvailableDays(currentMonth)
  }, [currentMonth])

  // --- 2. Cargar horas de un día específico ---
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return

    setSelectedDate(date)
    setIsLoadingTimes(true)
    setAvailableTimes([])
    setSelectedTime("")
    setIntention("")

    try {
      const dateString = formatDateForAPI(date)
      const res = await fetch(`${API_URL}/massSchedule/time-slots?date=${dateString}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error("No se pudieron cargar los horarios.")

      const data = await res.json()
      if (data.timeSlots && data.timeSlots.length > 0) {
        const availableSlots = data.timeSlots
          .filter((slot: TimeSlot) => slot.available)
          .map((slot: TimeSlot) => slot.time)
        setAvailableTimes(availableSlots)
      } else {
        setAvailableTimes([])
      }
    } catch (error: any) {
      toast.error("Error al cargar horarios", { description: error.message })
    } finally {
      setIsLoadingTimes(false)
    }
  }

  // --- 3. Validar formulario ---
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

  // --- 4. Crear solicitud de misa (sin pago aún) ---
  const handleCreateRequest = async () => {
    if (!selectedDate || !selectedTime || !intention) {
      toast.error("Datos incompletos", {
        description: "Debes seleccionar una fecha, una hora y escribir tu intención.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log('🚀 Creando solicitud de misa...')

      const res = await fetch('/api/requestMass', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          date: formatDateForAPI(selectedDate),
          time: selectedTime,
          intention: intention,
        }),
      })

      console.log('📡 Status de respuesta:', res.status)

      if (res.status === 401) {
        toast.error("Sesión expirada", {
          description: "Por favor inicia sesión nuevamente.",
        })
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo crear la solicitud")
      }

      const data = await res.json()
      console.log('✅ Solicitud creada:', data)

      // Guardar el ID de la solicitud
      setCreatedRequestId(data._id)

      toast.success("Solicitud creada", {
        description: "Ahora completa tus datos para el pago.",
      })

      // Abrir modal para pedir datos de pago
      setShowPaymentModal(true)

    } catch (error: any) {
      console.error('❌ Error al crear solicitud:', error)
      toast.error("Error al crear solicitud", {
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- 5. Función para abrir checkout de ePayco ---
  const openEpaycoCheckout = (epaycoData: any) => {
    console.log("💳 Iniciando apertura de checkout ePayco...")

    if (typeof window.ePayco === 'undefined') {
      console.error('❌ El script de ePayco no está cargado')
      toast.error('Error al cargar el sistema de pagos', {
        description: 'Por favor, recarga la página e intenta de nuevo.'
      })
      return
    }

    if (!epaycoData.publicKey || String(epaycoData.publicKey).trim() === '') {
      console.error('❌ Public Key vacía')
      toast.error('Error de configuración', {
        description: 'La clave pública de ePayco no fue recibida.'
      })
      return
    }

    try {
      const handler = window.ePayco.checkout.configure({
        key: String(epaycoData.publicKey).trim(),
        test: epaycoData.test === 'true' || epaycoData.test === true
      })

      const checkoutData = {
        name: epaycoData.name || 'Pago de misa',
        description: epaycoData.description || 'Pago por solicitud de misa',
        invoice: epaycoData.invoice,
        currency: 'cop',
        amount: String(epaycoData.amount).replace(/[^\d]/g, ''),
        tax_base: '0',
        tax: '0',
        country: 'co',
        lang: 'es',
        external: 'false',
        response: epaycoData.responseUrl || epaycoData.response,
        confirmation: epaycoData.confirmationUrl || epaycoData.confirmation,
        name_billing: String(epaycoData.name_billing || '').trim(),
        email_billing: String(epaycoData.email_billing || '').trim(),
        address_billing: String(epaycoData.address_billing || '').trim(),
        type_doc_billing: epaycoData.type_doc_billing || 'CC',
        mobilephone_billing: String(epaycoData.mobilephone_billing || '').replace(/[^\d]/g, ''),
        number_doc_billing: String(epaycoData.number_doc_billing || '').replace(/[^\d]/g, ''),
        extra1: epaycoData.extra1 || '',
        extra2: epaycoData.extra2 || '',
        extra3: epaycoData.extra3 || '',
      }

      console.log("✅ Datos preparados para checkout:", JSON.stringify(checkoutData, null, 2))

      if (typeof handler.open !== 'function') {
        console.error('❌ handler.open() no está disponible')
        throw new Error('El método open() no está disponible')
      }

      handler.open(checkoutData)
      console.log('✅ Checkout abierto exitosamente')

    } catch (error: any) {
      console.error('❌ Error al abrir checkout:', error)
      toast.error('Error al abrir la pasarela de pago', {
        description: error.message || 'Error desconocido',
        duration: 5000
      })
    }
  }

  // --- 6. Procesar pago ---
  const handleProcessPayment = async () => {
    if (!validateForm()) return
    if (!createdRequestId) {
      toast.error("Error", { description: "No se encontró la solicitud creada." })
      return
    }

    setIsSubmitting(true)
    setShowPaymentModal(false)

    try {
      console.log('💳 Creando pago para solicitud:', createdRequestId)

      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceType: 'mass',
          serviceId: createdRequestId,
          amount: MASS_PRICE,
          description: `Pago por solicitud de misa - ${format(selectedDate!, 'dd/MM/yyyy')} ${selectedTime}`,
          phone: phoneNumber,
          address: address,
        })
      })

      if (!paymentResponse.ok) {
        let error
        try {
          error = await paymentResponse.json()
        } catch {
          throw new Error('Error del servidor al crear el pago.')
        }

        const errorMsg = error.error || error.details?.message || 'Error al crear el pago'
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

      // Resetear formulario
      setSelectedDate(undefined)
      setAvailableTimes([])
      setSelectedTime("")
      setIntention("")
      setPhoneNumber("")
      setAddress("")
      setCreatedRequestId(null)
      fetchAvailableDays(currentMonth)

    } catch (error: any) {
      console.error("❌ Error en el proceso de pago:", error)
      toast.error("Error al procesar el pago", {
        description: error.message,
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
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

      <div className="flex h-screen bg-background">
        <Sidebar items={sidebarItems} userRole="feligrés" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Solicitud de Misas</h1>
              <p className="text-muted-foreground">Solicita una misa para tus intenciones y procede con el pago.</p>
            </div>

            {!epaycoLoaded && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⏳ Cargando sistema de pagos...
                </p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Programa tu Misa</CardTitle>
                <CardDescription>Sigue los 3 pasos para completar tu solicitud.</CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">

                {/* --- COLUMNA 1: CALENDARIO --- */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-center block">Paso 1: Selecciona la fecha</Label>

                  <div className="flex justify-center items-center pt-8">
                    <div className="scale-100">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        onMonthChange={setCurrentMonth}
                        disabled={(date) => date < addDays(new Date(), -1)}
                        modifiers={{ available: availableDays }}
                        modifiersClassNames={{
                          available: "bg-primary/20 text-primary rounded-full font-bold",
                        }}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground pt-8">
                    <span className="w-3 h-3 rounded-full bg-primary/20 mr-2"></span>
                    Días con horarios disponibles
                  </div>
                </div>

                {/* --- COLUMNA 2: HORARIOS E INTENCIÓN --- */}
                <div className="space-y-6">

                  {/* --- PASO 2: HORARIOS --- */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Paso 2: Selecciona la hora</Label>
                    {!selectedDate && (
                      <p className="text-sm text-muted-foreground">Selecciona un día del calendario.</p>
                    )}
                    {isLoadingTimes && (
                      <div className="flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando horarios...
                      </div>
                    )}
                    {!isLoadingTimes && selectedDate && availableTimes.length === 0 && (
                      <p className="text-sm text-destructive">No hay horarios disponibles para este día.</p>
                    )}
                    {availableTimes.length > 0 && (
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        value={selectedTime}
                        onValueChange={(value) => value && setSelectedTime(value)}
                        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                      >
                        {availableTimes.map((time) => (
                          <ToggleGroupItem key={time} value={time}>
                            {time}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )}
                  </div>

                  {/* --- PASO 3: INTENCIÓN --- */}
                  {selectedTime && (
                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                      <Label htmlFor="intention" className="text-lg font-medium">Paso 3: Escribe tu intención</Label>
                      <Textarea
                        id="intention"
                        placeholder="Ej: Por el alma de..., En acción de gracias por..., Por la salud de..."
                        value={intention}
                        onChange={(e) => setIntention(e.target.value)}
                        rows={4}
                      />

                      {/* Mostrar precio */}
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <span className="text-sm font-medium">Valor de la misa:</span>
                        <span className="text-lg font-bold text-primary">
                          ${MASS_PRICE.toLocaleString('es-CO')} COP
                        </span>
                      </div>

                      <Button
                        onClick={handleCreateRequest}
                        disabled={isSubmitting || !intention.trim() || !epaycoLoaded}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          "Continuar al Pago"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* --- MODAL PARA DATOS DE PAGO --- */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Completar Información de Pago</DialogTitle>
            <DialogDescription>
              Por favor completa tus datos para proceder con el pago de la misa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              onClick={() => setShowPaymentModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={!phoneNumber || !address || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Proceder al Pago"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}