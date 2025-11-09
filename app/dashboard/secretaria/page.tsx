"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FileText,
  Church,
  DollarSign,
  ClipboardList,
  Calendar,
  Users,
  Bell,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

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

// tipos
interface Stats {
  pendingRequests: number
  processedCertificates: number
  scheduledMasses: number
  pendingMassRequests: number
  pendingCertificateRequests: number
}

interface RecentActivity {
  _id: string
  type: "misa" | "partida"
  description: string
  applicantName: string
  createdAt: string
}

export default function SecretariaDashboard() {
  const [stats, setStats] = useState<Partial<Stats>>({})
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // stats
      setIsLoadingStats(true)
      try {
        const res = await fetch(`${API_URL}/dashboard/stats`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("No se pudieron cargar las estadísticas")
        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        toast.error("Error al cargar estadísticas", { description: err.message })
      } finally {
        setIsLoadingStats(false)
      }

      // actividad
      setIsLoadingActivity(true)
      try {
        const res = await fetch(`${API_URL}/dashboard/recent-activity`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("No se pudo cargar la actividad reciente")
        const data = await res.json()
        setRecentActivity(data)
      } catch (err: any) {
        toast.error("Error al cargar actividad", { description: err.message })
      } finally {
        setIsLoadingActivity(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* encabezado */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Panel de Secretaría</h1>
            <p className="text-muted-foreground">
              Gestiona las solicitudes y documentos parroquiales
            </p>
          </div>

          {/* ====== CARDS DE ARRIBA ====== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Solicitudes pendientes (sumamos partidas + misas) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats
                    ? "—"
                    : (stats.pendingCertificateRequests || 0) +
                      (stats.pendingMassRequests || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(stats.pendingCertificateRequests || 0)} partidas ·{" "}
                  {(stats.pendingMassRequests || 0)} misas
                </p>
              </CardContent>
            </Card>

            {/* Partidas procesadas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partidas Procesadas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? "—" : stats.processedCertificates || 0}
                </div>
                <p className="text-xs text-muted-foreground">En los últimos 30 días</p>
              </CardContent>
            </Card>

            {/* Misas programadas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Misas Programadas</CardTitle>
                <Church className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? "—" : stats.scheduledMasses || 0}
                </div>
                <p className="text-xs text-muted-foreground">Próximos 7 días</p>
              </CardContent>
            </Card>

            {/* Consultas atendidas (estático) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultas Atendidas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>
          </div>

          {/* ====== SECCIÓN DE ABAJO ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Solicitudes recientes dinamicas */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Recientes</CardTitle>
                <CardDescription>Últimas solicitudes recibidas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((act) => (
                      <div key={act._id} className="flex items-center space-x-4">
                        {/* puntico de color */}
                        <div
                          className={`w-2 h-2 rounded-full ${
                            act.type === "misa" ? "bg-blue-500" : "bg-yellow-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{act.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {act.applicantName}{" "}
                            {act.createdAt &&
                            new Date(act.createdAt).toString() !== "Invalid Date"
                              ? "· " + format(new Date(act.createdAt), "dd MMM, h:mm a")
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay actividad reciente.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tareas pendientes usando los mismos stats */}
            <Card>
              <CardHeader>
                <CardTitle>Tareas Pendientes</CardTitle>
                <CardDescription>Actividades por completar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Confirmar misas pendientes</p>
                      <p className="text-xs text-muted-foreground">
                        {isLoadingStats ? "—" : stats.pendingMassRequests || 0} pendientes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <FileText className="w-4 h-4 text-secondary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Revisar solicitudes de partidas</p>
                      <p className="text-xs text-muted-foreground">
                        {isLoadingStats ? "—" : stats.pendingCertificateRequests || 0}{" "}
                        pendientes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <DollarSign className="w-4 h-4 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Actualizar registro contable</p>
                      <p className="text-xs text-muted-foreground">Semanal</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
