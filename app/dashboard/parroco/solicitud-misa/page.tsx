"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  FileText,
  Church,
  DollarSign,
  ClipboardList,
  Calendar,
  Check,
  Trash2,
  Loader2,
  History,
  Eye,
  UserCheck,
  UserPlus,
  PlusCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// --- Sidebar ---
const sidebarItems = [
  {
    title: "Registro de Administrador",
    href: "/dashboard/parroco/registro",
    icon: UserPlus,
  },
  {
    title: "Gestión de Partidas",
    href: "/dashboard/parroco/partidas",
    icon: FileText,
  },
  {
    title: "Solicitudes de Partidas",
    href: "/dashboard/parroco/solicitud-partida",
    icon: ClipboardList,
  },
  {
    title: "Gestión de Misas",
    href: "/dashboard/parroco/misas",
    icon: Church,
  },
  {
    title: "Solicitudes de Misa",
    href: "/dashboard/parroco/solicitud-misa",
    icon: Calendar,
  },
  {
    title: "Contabilidad",
    href: "/dashboard/parroco/contabilidad",
    icon: DollarSign,
  },
]

// --- Constantes y Tipos ---
const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

interface SolicitudMisa {
  _id: string
  applicant: {
    name: string
    lastName: string
  } | null
  date: string
  time: string
  status: "Pendiente" | "Confirmada"
  intention: string
}

interface TimeSlot {
  time: string
  available: boolean
}

interface DocumentType {
  _id: string
  name: string
}

// Schema de Validación para el formulario DE AGENDAR
const formSchema = z.object({
  documentNumber: z.string().min(5, "Documento requerido"),
  typeDocument: z.string({ required_error: "Debe seleccionar un tipo." }),
  name: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  mail: z.string().email("Email requerido"),
  birthdate: z.string().date("Fecha requerida"),
  date: z.date({ required_error: "Debe seleccionar una fecha." }),
  time: z.string({ required_error: "Debe seleccionar una hora." }),
  intention: z.string().min(5, "La intención es requerida."),
})

type MassRequestFormValues = z.infer<typeof formSchema>

// --- Página Principal ---
export default function GestionSolicitudesMisa() {
  // --- Estados para la TABLA DE APROBACIÓN ---
  const [pendingMasses, setPendingMasses] = useState<SolicitudMisa[]>([])
  const [confirmedMasses, setConfirmedMasses] = useState<SolicitudMisa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, 'approve' | 'delete' | null>>({})
  const [viewingIntention, setViewingIntention] = useState<string | null>(null)
  
  // --- Estados para el MODAL DE AGENDAR ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [userExists, setUserExists] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDays, setAvailableDays] = useState<Date[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- Lógica de la TABLA DE APROBACIÓN ---
  const fetchPendingMasses = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/requestMass/earring`, { method: 'GET', credentials: 'include' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Error al cargar misas pendientes") }
      const data: SolicitudMisa[] = await res.json()
      setPendingMasses(data)
    } catch (error: any) {
      toast.error("Error al cargar pendientes", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConfirmedMasses = async () => {
    setIsHistoryLoading(true)
    setConfirmedMasses([]) 
    try {
      const res = await fetch(`${API_URL}/requestMass/confirmed`, { method: 'GET', credentials: 'include' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Error al cargar misas confirmadas") }
      const data: SolicitudMisa[] = await res.json()
      setConfirmedMasses(data)
    } catch (error: any) {
      toast.error("Error al cargar historial", { description: error.message })
    } finally {
      setIsHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingMasses()
  }, [])

  const handleApproveMass = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'approve' }))
    try {
      const res = await fetch(`${API_URL}/requestMass/confirm/${id}`, { method: 'POST', credentials: 'include' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "No se pudo confirmar la misa") }
      toast.success("Misa confirmada exitosamente")
      fetchPendingMasses() 
    } catch (error: any) {
      toast.error("Error al confirmar", { description: error.message })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }
  
  const handleDeleteMass = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'delete' }))
    try {
      const res = await fetch(`${API_URL}/requestMass/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "No se pudo eliminar la solicitud") }
      toast.success("Solicitud eliminada correctamente")
      fetchPendingMasses() 
    } catch (error: any) {
      toast.error("Error al eliminar", { description: error.message })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }
  
  const getApplicantName = (applicant: SolicitudMisa['applicant']) => {
    if (!applicant) {
      return <span className="text-muted-foreground italic">Usuario Eliminado</span>
    }
    return `${applicant.name} ${applicant.lastName}`
  }

  // --- Lógica del MODAL DE AGENDAR ---
  const form = useForm<MassRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { documentNumber: "", name: "", lastName: "", mail: "", birthdate: "", intention: "" },
  })
  const { setValue, trigger, getValues, control, watch, reset } = form
  const selectedDate = watch("date")

  // Cargar Tipos de Documento al abrir el modal
  const onModalOpenChange = (open: boolean) => {
    if (open && documentTypes.length === 0) { // Solo cargar una vez
      const fetchDocs = async () => {
          try {
            const res = await fetch(`${API_URL}/documentType/`, { credentials: "include" })
            if (!res.ok) throw new Error("Error al cargar tipos de documento")
            const data = await res.json()
            setDocumentTypes(data?.data || [])
          } catch (e) {
            toast.error("No se pudieron cargar los tipos de documento");
            setDocumentTypes([])
          }
        }
        fetchDocs()
    }
    if (!open) { // Limpiar al cerrar
      reset()
      setUserExists(false)
      setAvailableTimes([])
    }
    setIsCreateModalOpen(open)
  }

  const handleCheckUser = async () => {
    const documentNumber = getValues("documentNumber");
    if (documentNumber.length < 5) return; 
    setIsCheckingUser(true);
    try {
      const res = await fetch(`${API_URL}/user/by-document/${documentNumber}`, { method: 'GET', credentials: 'include' });
      if (res.ok) {
        const user = await res.json();
        setValue("name", user.name);
        setValue("lastName", user.lastName);
        setValue("mail", user.mail);
        setValue("birthdate", format(new Date(user.birthdate), "yyyy-MM-dd"));
        setValue("typeDocument", user.typeDocument._id); 
        setUserExists(true); 
        toast.success("Usuario encontrado.", { icon: <UserCheck className="text-green-500" /> });
        trigger(["name", "lastName", "mail", "birthdate", "typeDocument"]);
      } else {
        setUserExists(false); 
        toast.info("Usuario no registrado. Por favor, complete los datos.", { icon: <UserPlus className="text-blue-500" /> });
      }
    } catch (error) {
      setUserExists(false);
      toast.error("Error al verificar el usuario.");
    } finally {
      setIsCheckingUser(false);
    }
  };

  const fetchAvailableDays = async (month: Date) => {
    const start = startOfMonth(month); const end = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start, end });
    const today = new Date(); today.setHours(0, 0, 0, 0); 

    const promises = daysInMonth
      .filter(day => day >= today) 
      .map(day => {
        const dateString = format(day, "yyyy-MM-dd")
        return fetch(`${API_URL}/massSchedule/time-slots?date=${dateString}`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => (data.timeSlots && data.timeSlots.some((slot: TimeSlot) => slot.available)) ? day : null)
          .catch(() => null) 
      })
    const results = (await Promise.all(promises)).filter(d => d !== null) as Date[]
    setAvailableDays(results)
  }

  useEffect(() => { fetchAvailableDays(currentMonth) }, [currentMonth])

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      setValue("time", ""); 
      return;
    }
    const fetchSlots = async () => {
      setIsLoadingTimes(true);
      setAvailableTimes([]);
      setValue("time", ""); 
      try {
        const dateString = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(`${API_URL}/massSchedule/time-slots?date=${dateString}`, { credentials: 'include' });
        if (!res.ok) throw new Error("No se pudieron cargar los horarios.");
        const data = await res.json();
        if (data.timeSlots && data.timeSlots.length > 0) {
          const availableSlots = data.timeSlots.filter((slot: TimeSlot) => slot.available).map((slot: TimeSlot) => slot.time);
          setAvailableTimes(availableSlots);
        } else {
          setAvailableTimes([]);
          toast.info("No hay horarios disponibles para este día.");
        }
      } catch (error: any) {
        toast.error("Error al cargar horarios", { description: error.message });
      } finally {
        setIsLoadingTimes(false);
      }
    }
    fetchSlots();
  }, [selectedDate, setValue]);

  // Submit del formulario del modal
  const onSubmit = async (data: MassRequestFormValues) => {
    setIsSubmitting(true);
    const payload = { ...data, date: format(data.date, "yyyy-MM-dd") };
    try {
      const res = await fetch(`${API_URL}/requestMass/admin-create`, { 
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "No se pudo enviar la solicitud") }
      toast.success("Solicitud de Misa Creada", {
        description: `La solicitud para ${data.name} ${data.lastName} ha sido creada.`,
      })
      reset();
      setUserExists(false);
      setAvailableTimes([]);
      setIsCreateModalOpen(false); // Cierra el modal
    } catch (error: any) {
      toast.error("Error al crear la solicitud", { description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        <Sidebar items={sidebarItems} userRole="Párroco" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Gestión de Solicitudes de Misa</h1>
              <p className="text-muted-foreground">Confirma o elimina las solicitudes de misa de los feligreses.</p>
            </div>

            {/* --- Botones de Acción (Historial y Nuevo) --- */}
            <div className="flex justify-end mb-4 space-x-2">
              <Dialog onOpenChange={(open) => {
                if (open) fetchConfirmedMasses() 
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <History className="mr-2 h-4 w-4" />
                    Ver Historial
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  {/* ... (Contenido del modal de Historial) ... */}
                  <DialogHeader><DialogTitle>Historial de Misas Confirmadas</DialogTitle></DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Solicitante</TableHead><TableHead>Fecha</TableHead><TableHead>Hora</TableHead><TableHead>Intención</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {isHistoryLoading ? (
                          <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Cargando...</TableCell></TableRow>
                        ) : confirmedMasses.length > 0 ? (
                          confirmedMasses.map((req) => (
                            <TableRow key={req._id}>
                              <TableCell>{getApplicantName(req.applicant)}</TableCell>
                              <TableCell>{format(new Date(req.date), "dd/MM/yyyy")}</TableCell>
                              <TableCell>{req.time}</TableCell>
                              <TableCell className="truncate max-w-xs">{req.intention}</TableCell>
                              <TableCell><Badge variant="success">Confirmada</Badge></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={5} className="text-center">No hay misas confirmadas.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>

              {/* --- ✨ ESTE ES EL NUEVO BOTÓN Y MODAL --- */}
              <Dialog open={isCreateModalOpen} onOpenChange={onModalOpenChange}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agendar Misa Asistida
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Agendar Nueva Misa (Asistida)</DialogTitle>
                    <DialogDescription>
                      Completa los 3 pasos para agendar una misa para un feligrés no registrado o existente.
                    </DialogDescription>
                  </DialogHeader>
                  {/* --- Aquí insertamos el formulario inteligente --- */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Paso 1: Datos del Solicitante</CardTitle>
                          <CardDescription>Busca por DNI o crea un nuevo registro de feligrés.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={control} name="documentNumber" render={({ field }) => (
                              <FormItem><FormLabel>Número de Documento</FormLabel><div className="flex items-center space-x-2"><FormControl><Input placeholder="DNI..." {...field} onBlur={handleCheckUser} /></FormControl>{isCheckingUser && <Loader2 className="h-4 w-4 animate-spin" />}</div><FormMessage /></FormItem>
                            )} />
                            <FormField control={control} name="typeDocument" render={({ field }) => (
                              <FormItem><FormLabel>Tipo de Documento</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={userExists}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger></FormControl><SelectContent>{documentTypes.map((doc) => (<SelectItem key={doc._id} value={doc._id}>{doc.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="Nombres..." {...field} disabled={userExists} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Apellidos..." {...field} disabled={userExists} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={control} name="mail" render={({ field }) => (<FormItem><FormLabel>Correo</FormLabel><FormControl><Input type="email" placeholder="correo..." {...field} disabled={userExists} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={control} name="birthdate" render={({ field }) => (<FormItem><FormLabel>Fecha Nacimiento</FormLabel><FormControl><Input type="date" {...field} disabled={userExists} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader><CardTitle>Paso 2: Fecha y Hora de la Misa</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4 flex flex-col items-center">
                            <FormField control={control} name="date" render={({ field }) => (
                              <FormItem><FormControl><UiCalendar mode="single" selected={field.value} onSelect={field.onChange} onMonthChange={setCurrentMonth} disabled={(date) => date < addDays(new Date(), -1)} modifiers={{ available: availableDays }} modifiersClassNames={{ available: "bg-primary/20 text-primary rounded-full font-bold" }} className="rounded-md border" /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                          <div className="space-y-4">
                            <Label>Horas Disponibles</Label>
                            {isLoadingTimes && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando...</div>}
                            {!isLoadingTimes && !selectedDate && <p className="text-sm text-muted-foreground">Selecciona un día.</p>}
                            {!isLoadingTimes && selectedDate && availableTimes.length === 0 && <p className="text-sm text-destructive">No hay horas disponibles.</p>}
                            {availableTimes.length > 0 && (
                              <FormField control={control} name="time" render={({ field }) => (
                                <FormItem><FormControl><ToggleGroup type="single" variant="outline" value={field.value} onValueChange={field.onChange} className="grid grid-cols-3 gap-2">{availableTimes.map((time) => (<ToggleGroupItem key={time} value={time}>{time}</ToggleGroupItem>))}</ToggleGroup></FormControl><FormMessage /></FormItem>
                              )} />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Paso 3: Intención de la Misa</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <FormField control={control} name="intention" render={({ field }) => (
                            <FormItem><FormLabel>Intención</FormLabel><FormControl><Textarea placeholder="Ej: Por el alma de..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Solicitud de Misa"}
                          </Button>
                        </CardContent>
                      </Card>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* --- TABLA DE APROBACIÓN (La lógica original de tu .js) --- */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Misa Pendientes</CardTitle>
                <CardDescription>Solicitudes enviadas por feligreses que esperan confirmación.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Cargando...
                        </TableCell>
                      </TableRow>
                    ) : pendingMasses.length > 0 ? (
                      pendingMasses.map((req) => (
                        <TableRow key={req._id}>
                          <TableCell className="font-medium">{getApplicantName(req.applicant)}</TableCell>
                          <TableCell>{format(new Date(req.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{req.time}</TableCell>
                          <TableCell><Badge variant="outline">{req.status}</Badge></TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setViewingIntention(req.intention)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default" 
                              onClick={() => handleApproveMass(req._id)}
                              disabled={!!actionLoading[req._id]}
                            >
                              {actionLoading[req._id] === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMass(req._id)}
                              disabled={!!actionLoading[req._id]}
                            >
                              {actionLoading[req._id] === 'delete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No hay solicitudes pendientes.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* --- MODAL PARA VER INTENCIÓN (de la tabla) --- */}
      <Dialog open={!!viewingIntention} onOpenChange={(isOpen) => !isOpen && setViewingIntention(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Intención de la Misa</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-base text-muted-foreground max-h-[60vh] overflow-y-auto">
            {viewingIntention}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewingIntention(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}