"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar" // Importamos el calendario
import { Label } from "@/components/ui/label"
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
import { ClipboardList, Calendar as CalendarIcon, History, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns" // Para manejar fechas

// --- Sidebar ---
const sidebarItems = [
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

// --- Constantes y Tipos ---
const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

interface TimeSlot {
  time: string
  available: boolean
}

export default function SolicitudMisasFeligres() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDays, setAvailableDays] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [intention, setIntention] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Formateador de fecha a YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    return format(date, "yyyy-MM-dd")
  }

  // --- 1. Lógica para cargar los días disponibles del mes ---
  const fetchAvailableDays = async (month: Date) => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const daysInMonth = eachDayOfInterval({ start, end })

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorar la hora para la comparación

    const promises = daysInMonth
      .filter(day => day >= today) // Solo verificar días desde hoy en adelante
      .map(day => {
        const dateString = formatDateForAPI(day)
        return fetch(`${API_URL}/massSchedule/time-slots?date=${dateString}`, {
          credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            if (data.timeSlots && data.timeSlots.some((slot: TimeSlot) => slot.available)) {
              return day // Si hay al menos un slot, marcamos el día
            }
            return null
          })
          .catch(() => null) // Ignorar errores de días individuales
      })
    
    const results = (await Promise.all(promises)).filter(d => d !== null) as Date[]
    setAvailableDays(results)
  }

  // Cargar días disponibles al montar y al cambiar de mes
  useEffect(() => {
    fetchAvailableDays(currentMonth)
  }, [currentMonth])

  // --- 2. Lógica para cargar las horas de un día específico ---
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

  // --- 3. Lógica para enviar la solicitud de misa ---
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !intention) {
      toast.error("Datos incompletos", {
        description: "Debes seleccionar una fecha, una hora y escribir tu intención.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/requestMass`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Usamos cookies
        body: JSON.stringify({
          date: formatDateForAPI(selectedDate),
          time: selectedTime,
          intention: intention,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo enviar la solicitud")
      }
      
      // No usamos toast.success, en su lugar, mostramos el modal de éxito
      setShowSuccessModal(true)
      
      // Resetear el formulario
      setSelectedDate(undefined)
      setAvailableTimes([])
      setSelectedTime("")
      setIntention("")
      fetchAvailableDays(currentMonth) // Recargar días disponibles

    } catch (error: any) {
      toast.error("Error al enviar", { description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        <Sidebar items={sidebarItems} userRole="feligrés" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Solicitud de Misas</h1>
              <p className="text-muted-foreground">Solicita una misa para tus intenciones.</p>
            </div>

            <Card className="max-w-4xl">
              <CardHeader>
                <CardTitle>Programa tu Misa</CardTitle>
                <CardDescription>Sigue los 3 pasos para completar tu solicitud.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                
                {/* --- PASO 1: CALENDARIO --- */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium">Paso 1: Selecciona la fecha</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      onMonthChange={setCurrentMonth} // Para recargar los días disponibles
                      disabled={(date) => date < addDays(new Date(), -1)} // Deshabilitar días pasados
                      modifiers={{ available: availableDays }} // Días disponibles
                      modifiersClassNames={{
                        available: "bg-primary/20 text-primary-foreground rounded-full",
                      }}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="w-3 h-3 rounded-full bg-primary/20 mr-2"></span>
                    Días con horarios disponibles
                  </div>
                </div>

                {/* --- PASO 2 y 3: HORARIOS E INTENCIÓN --- */}
                <div className="space-y-6">
                  {/* --- PASO 2: HORARIOS --- */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Paso 2: Selecciona la hora</Label>
                    {isLoadingTimes && (
                      <div className="flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando horarios...
                      </div>
                    )}
                    {!isLoadingTimes && !selectedDate && (
                      <p className="text-sm text-muted-foreground">Selecciona un día del calendario.</p>
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
                      <Button onClick={handleSubmit} disabled={isSubmitting || !intention.trim()} className="w-full">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Solicitud"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* --- MODAL DE ÉXITO (con QR) --- */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">¡Solicitud Enviada!</DialogTitle>
            <DialogDescription className="text-center text-base">
              Tu solicitud ha sido recibida.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-4">
              Para confirmar y aprobar tu solicitud, por favor comunícate a nuestro WhatsApp y realiza el pago respectivo.
            </p>
            {/* Asumimos que la imagen QR está en la carpeta /public/img/ */}
            <img 
              src="/img/QR.png" 
              alt="Código QR de pago" 
              className="w-32 h-32 mx-auto rounded-md border p-1"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)} className="w-full">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}