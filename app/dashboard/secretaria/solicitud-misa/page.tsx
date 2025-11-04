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
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns" // Para formatear la fecha

// --- Sidebar (copiado de tu .tsx) ---
const sidebarItems = [
  {
    title: "Gestión de Partidas",
    href: "/dashboard/secretaria/partidas",
    icon: FileText,
  },
  {
    title: "Solicitudes de Partidas",
    href: "/dashboard/secretaria/solicitud-partida",
    icon: ClipboardList,
  },
  {
    title: "Gestión de Misas",
    href: "/dashboard/secretaria/misas",
    icon: Church,
  },
  {
    title: "Solicitudes de Misa",
    href: "/dashboard/secretaria/solicitud-misa",
    icon: Calendar,
  },
  {
    title: "Contabilidad",
    href: "/dashboard/secretaria/contabilidad",
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
  }
  date: string
  time: string
  status: "Pendiente" | "Confirmada"
  intention: string
}

export default function GestionSolicitudesMisa() {
  const [pendingMasses, setPendingMasses] = useState<SolicitudMisa[]>([])
  const [confirmedMasses, setConfirmedMasses] = useState<SolicitudMisa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  
  // Estado para la carga de botones (Confirmar/Eliminar)
  const [actionLoading, setActionLoading] = useState<Record<string, 'approve' | 'delete' | null>>({})
  
  // Estado para ver la intención en un modal
  const [viewingIntention, setViewingIntention] = useState<string | null>(null)

  // --- 1. Cargar Misas Pendientes ---
  const fetchPendingMasses = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/requestMass/earring`, {
        method: 'GET',
        credentials: 'include', // Usamos cookies
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al cargar las misas pendientes")
      }
      
      const data: SolicitudMisa[] = await res.json()
      setPendingMasses(data)
    } catch (error: any) {
      toast.error("Error al cargar pendientes", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // --- 2. Cargar Misas Confirmadas (para el Modal) ---
  const fetchConfirmedMasses = async () => {
    setIsHistoryLoading(true)
    setConfirmedMasses([]) // Limpiar antes de cargar
    try {
      const res = await fetch(`${API_URL}/requestMass/confirmed`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al cargar las misas confirmadas")
      }
      
      const data: SolicitudMisa[] = await res.json()
      setConfirmedMasses(data)
    } catch (error: any) {
      toast.error("Error al cargar historial", { description: error.message })
    } finally {
      setIsHistoryLoading(false)
    }
  }

  // Cargar las pendientes al iniciar la página
  useEffect(() => {
    fetchPendingMasses()
  }, [])

  // --- 3. Función para Confirmar Misa ---
  const handleApproveMass = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'approve' }))
    try {
      const res = await fetch(`${API_URL}/requestMass/confirm/${id}`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "No se pudo confirmar la misa")
      }
      
      toast.success("Misa confirmada exitosamente")
      fetchPendingMasses() // Recargamos la lista de pendientes
      
    } catch (error: any) {
      toast.error("Error al confirmar", { description: error.message })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }
  
  // --- 4. Función para Eliminar Solicitud de Misa ---
  const handleDeleteMass = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'delete' }))
    try {
      const res = await fetch(`${API_URL}/requestMass/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo eliminar la solicitud")
      }
      
      toast.success("Solicitud eliminada correctamente")
      fetchPendingMasses() // Recargamos la lista de pendientes
      
    } catch (error: any) {
      toast.error("Error al eliminar", { description: error.message })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        <Sidebar items={sidebarItems} userRole="secretaria" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Gestión de Solicitudes de Misa</h1>
              <p className="text-muted-foreground">Confirma o elimina las solicitudes de misa de los feligreses.</p>
            </div>

            {/* Botón para abrir el Modal (Dialog) de Misas Confirmadas */}
            <div className="flex justify-end mb-4">
              <Dialog onOpenChange={(open) => {
                if (open) fetchConfirmedMasses() // Carga las confirmadas solo al abrir el modal
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <History className="mr-2 h-4 w-4" />
                    Ver Historial de Confirmadas
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Historial de Misas Confirmadas</DialogTitle>
                    <DialogDescription>
                      Lista de todas las solicitudes que ya han sido procesadas y confirmadas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Solicitante</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Intención</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isHistoryLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Cargando historial...
                            </TableCell>
                          </TableRow>
                        ) : confirmedMasses.length > 0 ? (
                          confirmedMasses.map((req) => (
                            <TableRow key={req._id}>
                              <TableCell>{req.applicant.name} {req.applicant.lastName}</TableCell>
                              <TableCell>{format(new Date(req.date), "dd/MM/yyyy")}</TableCell>
                              <TableCell>{req.time}</TableCell>
                              <TableCell className="truncate max-w-xs">{req.intention}</TableCell>
                              <TableCell><Badge variant="success">Confirmada</Badge></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">No hay misas confirmadas.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Card que contiene la Tabla de Misas Pendientes */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Misa Pendientes</CardTitle>
                <CardDescription>Misas que requieren tu atención para ser confirmadas o eliminadas.</CardDescription>
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
                          <TableCell className="font-medium">{req.applicant.name} {req.applicant.lastName}</TableCell>
                          <TableCell>{format(new Date(req.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{req.time}</TableCell>
                          <TableCell><Badge variant="outline">{req.status}</Badge></TableCell>
                          <TableCell className="text-right space-x-2">
                            {/* Botón para ver la intención */}
                            <Button variant="outline" size="sm" onClick={() => setViewingIntention(req.intention)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {/* Botón para Confirmar */}
                            <Button
                              size="sm"
                              variant="default" // Usamos color primario para la acción principal
                              onClick={() => handleApproveMass(req._id)}
                              disabled={!!actionLoading[req._id]}
                            >
                              {actionLoading[req._id] === 'approve' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Confirmar
                            </Button>
                            
                            {/* Botón para Eliminar */}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMass(req._id)}
                              disabled={!!actionLoading[req._id]}
                            >
                              {actionLoading[req._id] === 'delete' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
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

      {/* --- MODAL PARA VER INTENCIÓN --- */}
      <Dialog open={!!viewingIntention} onOpenChange={(isOpen) => !isOpen && setViewingIntention(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Intención de la Misa</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-base text-muted-foreground">
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