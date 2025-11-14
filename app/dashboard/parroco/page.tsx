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
import { Skeleton } from "@/components/ui/skeleton"
import {
  UserPlus,
  FileText,
  Church,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"   // 👈 Locale en español

// --- Constantes ---
const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

const sidebarItems = [
  {
    title: "Inicio",
    href: "/dashboard/parroco",
    icon: Church,
  },
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
    title: "Gestión de Misas",
    href: "/dashboard/parroco/misas",
    icon: Church,
  },
  {
    title: "Agenda de Misas",
    href: "/dashboard/parroco/solicitud-misa",
    icon: Calendar,
  },
  {
    title: "Contabilidad",
    href: "/dashboard/parroco/contabilidad",
    icon: DollarSign,
  },
]

// --- Tipos ---
interface Stats {
  pendingRequests: number
  processedCertificates: number
  scheduledMasses: number
  pendingMassRequests: number
  pendingCertificateRequests: number
  totalUsers: number
  massesThisMonth: number
  certificatesThisMonth: number
  incomeThisMonth: number
}

interface RecentActivity {
  _id: string
  type: "misa" | "partida"
  description: string
  applicantName: string
  createdAt: string
}

interface UpcomingEvent {
  _id: string
  title: string
  description: string
  date: string
  time: string
  applicant: string
}

// --- Utilidades ---
const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
})

// Helper para fechas UTC (el mismo que usamos en otras partes)
function parseUTCDate(dateString: string): Date {
  const date = new Date(dateString)
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

// Traducción de tipos de solicitud que vienen en inglés
const SACRAMENT_TRANSLATIONS: Record<string, string> = {
  Baptism: "Bautismo",
  Confirmation: "Confirmación",
  Death: "Defunción",
  Marriage: "Matrimonio",
}

function translateSacramentsInText(text: string): string {
  return Object.entries(SACRAMENT_TRANSLATIONS).reduce(
    (acc, [en, esWord]) =>
      acc.replace(new RegExp(en, "g"), esWord), // reemplaza todas las apariciones
    text
  )
}

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="mb-2 h-8 w-1/4" />
      <Skeleton className="h-3 w-1/3" />
    </CardContent>
  </Card>
)

export default function ParrocoDashboard() {
  const [stats, setStats] = useState<Partial<Stats>>({})
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Estadísticas
      setIsLoadingStats(true)
      try {
        const res = await fetch(`${API_URL}/dashboard/stats`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Error al cargar estadísticas")
        const data = await res.json()
        setStats(data)
      } catch (error: any) {
        console.error(error)
        toast.error("Error al cargar estadísticas", {
          description: error.message,
        })
      } finally {
        setIsLoadingStats(false)
      }

      // 2. Actividad Reciente
      setIsLoadingActivity(true)
      try {
        const res = await fetch(`${API_URL}/dashboard/recent-activity`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Error al cargar actividad reciente")
        const data = await res.json()
        setRecentActivity(data)
      } catch (error: any) {
        console.error(error)
        toast.error("Error al cargar actividad reciente", {
          description: error.message,
        })
      } finally {
        setIsLoadingActivity(false)
      }

      // 3. Próximos Eventos (Misas)
      setIsLoadingEvents(true)
      try {
        const res = await fetch(`${API_URL}/dashboard/upcoming-events`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Error al cargar eventos")
        const data = await res.json()
        setUpcomingEvents(data)
      } catch (error: any) {
        console.error(error)
        toast.error("Error al cargar eventos próximos", {
          description: error.message,
        })
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="Párroco" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Panel del Párroco</h1>
            <p className="text-muted-foreground">
              Bienvenido al sistema de gestión parroquial
            </p>
          </div>

          {/* --- Stats Cards --- */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isLoadingStats ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Feligreses Activos
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Registrados en el sistema
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Misas este Mes
                    </CardTitle>
                    <Church className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.massesThisMonth || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Confirmadas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Partidas Emitidas
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.certificatesThisMonth || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Este mes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ingresos del Mes
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currencyFormatter.format(stats.incomeThisMonth || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total recaudado</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* --- Sección inferior: Actividad + Próximos eventos --- */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle>Actividades Recientes</CardTitle>
                <CardDescription>Últimas acciones en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity._id}
                        className="flex items-center space-x-4"
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            activity.type === "misa"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {/* Traducción de Baptism/Confirmation/... */}
                            {translateSacramentsInText(activity.description)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.applicantName}
                            {activity.createdAt &&
                            new Date(activity.createdAt).toString() !==
                              "Invalid Date"
                              ? ` - ${format(
                                  new Date(activity.createdAt),
                                  "dd 'de' MMMM, HH:mm",
                                  { locale: es } // 👈 fecha en español
                                )}`
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

            {/* Próximos Eventos (Misas Confirmadas) */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Misas programadas próximamente</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEvents ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event._id}
                        className="flex items-center space-x-4"
                      >
                        <Calendar className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {event.description || "Misa Confirmada"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              parseUTCDate(event.date),
                              "EEEE d 'de' MMMM",
                              { locale: es } // 👈 fecha en español
                            )}{" "}
                            - {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay eventos próximos.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
