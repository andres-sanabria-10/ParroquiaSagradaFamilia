"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  FileText,
  Church,
  DollarSign,
  ClipboardList,
  Calendar as CalendarIcon, // Renombrado para evitar conflicto
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

// --- Sidebar ---
const sidebarItems = [
  {
    title: "Gestión de Partidas",
    href: "/dashboard/secretaria/partidas",
    icon: FileText,
  },
  {
    title: "Gestión de Misas",
    href: "/dashboard/secretaria/misas",
    icon: Church,
  },
  {
    title: "Agenda de Misas",
    href: "/dashboard/secretaria/solicitud-misa",
    icon: CalendarIcon, // Usamos el ícono renombrado
  },
  {
    title: "Contabilidad",
    href: "/dashboard/secretaria/contabilidad",
    icon: DollarSign,
  },
]

// --- Constantes y Tipos ---
const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

// Horarios de 8:00 a 18:00, como en tu .js
const HORAS_DEL_DIA = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`)

interface TimeSlot {
  time: string
  available: boolean
}

// --- Componente Principal ---
export default function GestionMisasSecretaria() {
  // --- Estados para la Pestaña "Programar" ---
  const [addDate, setAddDate] = useState<Date | undefined>(undefined)
  const [addSelectedTimes, setAddSelectedTimes] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // --- Estados para la Pestaña "Gestionar" ---
  const [deleteDate, setDeleteDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([])
  const [deleteSelectedTimes, setDeleteSelectedTimes] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Formateador de fecha a YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // --- Lógica para "Programar Horarios" ---
  const handleSaveSchedule = async () => {
    if (!addDate || addSelectedTimes.length === 0) {
      toast.error("Datos incompletos", {
        description: "Por favor, selecciona una fecha y al menos un horario.",
      })
      return
    }

    setIsSaving(true)
    const massData = {
      date: formatDateForAPI(addDate),
      timeSlots: addSelectedTimes.map(time => ({ time, available: true })),
    }

    try {
      const res = await fetch(`${API_URL}/massSchedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Usamos cookies
        body: JSON.stringify(massData),
      })
      
      const data = await res.json()

      if (!res.ok || data.message) {
        throw new Error(data.message || "Error al guardar los horarios")
      }
      
      toast.success("Horarios guardados", {
        description: `Se han añadido ${addSelectedTimes.length} horarios para el ${formatDateForAPI(addDate)}.`,
      })
      setAddDate(undefined)
      setAddSelectedTimes([])
    } catch (error: any) {
      toast.error("Error al guardar", { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  // --- Lógica para "Gestionar Horarios" ---

  // 1. Cargar horarios cuando se selecciona una fecha
  useEffect(() => {
    if (!deleteDate) {
      setAvailableTimes([])
      return
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true)
      setAvailableTimes([])
      setDeleteSelectedTimes([])
      try {
        const dateString = formatDateForAPI(deleteDate)
        const res = await fetch(`${API_URL}/massSchedule/time-slots?date=${dateString}`, {
          credentials: 'include',
        })
        
        if (!res.ok) throw new Error("No se pudieron cargar los horarios.")
        
        const data = await res.json()
        if (data.timeSlots && data.timeSlots.length > 0) {
          setAvailableTimes(data.timeSlots)
        } else {
          setAvailableTimes([])
          toast.info("No hay horarios programados para esta fecha.")
        }
      } catch (error: any) {
        toast.error("Error al cargar horarios", { description: error.message })
      } finally {
        setIsLoadingSlots(false)
      }
    }
    
    fetchSlots()
  }, [deleteDate]) // Se ejecuta cada vez que 'deleteDate' cambia

  // 2. Eliminar los horarios seleccionados
  const handleDeleteSchedule = async () => {
    if (!deleteDate || deleteSelectedTimes.length === 0) {
      toast.error("Datos incompletos", {
        description: "Por favor, selecciona una fecha y al menos un horario para eliminar.",
      })
      return
    }

    setIsDeleting(true)
    const deleteData = {
      date: formatDateForAPI(deleteDate),
      timeSlots: deleteSelectedTimes,
    }

    try {
      const res = await fetch(`${API_URL}/massSchedule/remove-time-slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(deleteData),
      })
      
      if (!res.ok) throw new Error("Error al eliminar los horarios.")

      toast.success("Horarios eliminados", {
        description: `Se han eliminado ${deleteSelectedTimes.length} horarios.`,
      })
      
      // Refrescar la lista de horarios disponibles
      setDeleteSelectedTimes([])
      if (deleteDate) {
        // Simulamos un "clic" en la fecha para recargar los datos
        const date = new Date(deleteDate)
        setDeleteDate(undefined) // Truco para forzar el useEffect
        setTimeout(() => setDeleteDate(date), 0)
      }
      
    } catch (error: any) {
      toast.error("Error al eliminar", { description: error.message })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Misas</h1>
            <p className="text-muted-foreground">Administra el calendario de horarios disponibles para celebraciones.</p>
          </div>

          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Programar Horarios</TabsTrigger>
              <TabsTrigger value="manage">Gestionar Horarios</TabsTrigger>
            </TabsList>
            
            {/* ================================== */}
            {/* === Pestaña 1: Programar Horarios === */}
            {/* ================================== */}
            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle>Programar Nuevos Horarios</CardTitle>
                  <CardDescription>
                    Selecciona una fecha y luego elige las horas que estarán disponibles para la reserva de misas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* --- Calendario --- */}
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={addDate}
                      onSelect={setAddDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Deshabilitar días pasados
                      className="rounded-md border"
                    />
                  </div>
                  
                  {/* --- Selector de Horas --- */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Selecciona las horas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {addDate ? `Horarios para el ${addDate.toLocaleDateString()}:` : "Selecciona una fecha primero"}
                    </p>
                    {addDate && (
                      <ToggleGroup
                        type="multiple"
                        variant="outline"
                        value={addSelectedTimes}
                        onValueChange={(value) => setAddSelectedTimes(value)}
                        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                      >
                        {HORAS_DEL_DIA.map((hour) => (
                          <ToggleGroupItem key={hour} value={hour}>
                            {hour}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSchedule} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Horarios"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* =================================== */}
            {/* === Pestaña 2: Gestionar Horarios === */}
            {/* =================================== */}
            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle>Gestionar Horarios Existentes</CardTitle>
                  <CardDescription>
                    Selecciona una fecha para ver y eliminar horarios previamente programados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* --- Calendario --- */}
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={deleteDate}
                      onSelect={setDeleteDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border"
                    />
                  </div>
                  
                  {/* --- Selector de Horas a Eliminar --- */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Horarios Programados</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {deleteDate ? `Horarios para el ${deleteDate.toLocaleDateString()}:` : "Selecciona una fecha"}
                    </p>
                    
                    {isLoadingSlots && (
                      <div className="flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando horarios...
                      </div>
                    )}

                    {!isLoadingSlots && deleteDate && availableTimes.length === 0 && (
                      <p className="text-sm text-center text-muted-foreground py-4">
                        No hay horarios programados para esta fecha.
                      </p>
                    )}

                    {availableTimes.length > 0 && (
                      <ToggleGroup
                        type="multiple"
                        variant="outline"
                        value={deleteSelectedTimes}
                        onValueChange={(value) => setDeleteSelectedTimes(value)}
                        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                      >
                        {availableTimes.map((slot) => (
                          <ToggleGroupItem key={slot.time} value={slot.time}>
                            {slot.time}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteSchedule} 
                    disabled={isDeleting || deleteSelectedTimes.length === 0}
                  >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Eliminar Horarios Seleccionados"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}