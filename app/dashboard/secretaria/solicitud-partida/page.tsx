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
} from "@/components/ui/dialog"
import {
  FileText,
  Church,
  DollarSign,
  ClipboardList,
  Calendar,
  Send,
  Trash2,
  Loader2,
  History,
  BookOpenText,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

// --- Sidebar (copiado de tu archivo .tsx) ---
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
    title: "Solicitud de Misa",
    href: "/dashboard/secretaria/solicitud-misa",
    icon: Calendar,
  },
  {
    title: "Contabilidad",
    href: "/dashboard/secretaria/contabilidad",
    icon: DollarSign,
  },
]

// --- Definición del tipo de dato para las solicitudes ---
interface Solicitud {
  _id: string
  applicant: {
    name: string
    lastName: string
  }
  departureType: string
  requestDate: string
  status: "Pendiente" | "Enviada"
}

export default function SolicitudesDePartidas() {
  const [pendingRequests, setPendingRequests] = useState<Solicitud[]>([])
  const [sentRequests, setSentRequests] = useState<Solicitud[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estado para la carga de botones individuales (enviar/eliminar)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // --- 1. Cargar Solicitudes Pendientes (useEffect) ---
  const fetchPendingRequests = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("https://api-parroquiasagradafamilia-s6qu.onrender.com/requestDeparture/earring", {
        method: 'GET',
        // ¡Importante! Usamos credenciales de cookie
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al cargar las solicitudes pendientes")
      }
      
      const data: Solicitud[] = await res.json()
      setPendingRequests(data)
    } catch (error: any) {
      toast.error("Error al cargar pendientes", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // --- 2. Cargar Solicitudes Enviadas (para el Modal) ---
  const fetchSentRequests = async () => {
    try {
      const res = await fetch("https://api-parroquia.onrender.com/requestDeparture/sent", {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al cargar las solicitudes enviadas")
      }
      
      const data: Solicitud[] = await res.json()
      setSentRequests(data)
    } catch (error: any) {
      toast.error("Error al cargar enviadas", { description: error.message })
    }
  }

  // Cargar las pendientes al iniciar la página
  useEffect(() => {
    fetchPendingRequests()
  }, [])

  // --- 3. Función para Enviar Partida ---
  const handleSendRequest = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`https://api-parroquia.onrender.com/requestDeparture/send/${id}`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo enviar la partida")
      }
      
      toast.success("Partida enviada exitosamente")
      fetchPendingRequests() // Recargamos la lista de pendientes
      
    } catch (error: any) {
      toast.error("Error al enviar", { description: error.message })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }
  
  // --- 4. Función para Eliminar Solicitud ---
  const handleDeleteRequest = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`https://api-parroquia.onrender.com/requestDeparture/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo eliminar la solicitud")
      }
      
      toast.success("Solicitud eliminada correctamente")
      fetchPendingRequests() // Recargamos la lista de pendientes
      
    } catch (error: any) {
      toast.error("Error al eliminar", { description: error.message })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Solicitudes</h1>
            <p className="text-muted-foreground">Administra las solicitudes de partidas sacramentales.</p>
          </div>

          {/* Botón para abrir el Modal (Dialog) de Partidas Enviadas */}
          <div className="flex justify-end mb-4">
            <Dialog onOpenChange={(open) => {
              if (open) fetchSentRequests() // Carga las enviadas solo al abrir el modal
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <History className="mr-2 h-4 w-4" />
                  Ver Historial de Enviadas
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Historial de Partidas Enviadas</DialogTitle>
                  <DialogDescription>
                    Lista de todas las solicitudes que ya han sido procesadas y enviadas.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Tipo de Partida</TableHead>
                        <TableHead>Fecha Solicitud</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentRequests.length > 0 ? (
                        sentRequests.map((req) => (
                          <TableRow key={req._id}>
                            <TableCell>{req.applicant.name} {req.applicant.lastName}</TableCell>
                            <TableCell>{req.departureType}</TableCell>
                            <TableCell>{new Date(req.requestDate).toLocaleDateString()}</TableCell>
                            <TableCell><Badge variant="success">Enviada</Badge></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">No hay partidas enviadas.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Card que contiene la Tabla de Partidas Pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
              <CardDescription>Partidas que requieren tu atención para ser enviadas o eliminadas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Tipo de Partida</TableHead>
                    <TableHead>Fecha Solicitud</TableHead>
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
                  ) : pendingRequests.length > 0 ? (
                    pendingRequests.map((req) => (
                      <TableRow key={req._id}>
                        <TableCell className="font-medium">{req.applicant.name} {req.applicant.lastName}</TableCell>
                        <TableCell>{req.departureType}</TableCell>
                        <TableCell>{new Date(req.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="outline">{req.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSendRequest(req._id)}
                            disabled={actionLoading[req._id]}
                          >
                            {actionLoading[req._id] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            Enviar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRequest(req._id)}
                            disabled={actionLoading[req._id]}
                          >
                            {actionLoading[req._id] ? (
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
  )
}