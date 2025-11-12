"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, FileText, Church, DollarSign, Users, Calendar, ClipboardList } from "lucide-react"

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

export default function ParrocoDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="párroco" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Panel del Párroco</h1>
            <p className="text-muted-foreground">Bienvenido al sistema de gestión parroquial</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feligreses Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Misas este Mes</CardTitle>
                <Church className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">4 misas por semana</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partidas Emitidas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">+8 esta semana</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,450</div>
                <p className="text-xs text-muted-foreground">+15% vs mes anterior</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividades Recientes</CardTitle>
                <CardDescription>Últimas acciones en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nueva partida de bautismo emitida</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Misa dominical programada</p>
                      <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nuevo administrador registrado</p>
                      <p className="text-xs text-muted-foreground">Hace 1 día</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Actividades programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Misa Dominical</p>
                      <p className="text-xs text-muted-foreground">Domingo 10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Curso Prematrimonial</p>
                      <p className="text-xs text-muted-foreground">Sábado 3:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-4 h-4 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Reunión de Catequistas</p>
                      <p className="text-xs text-muted-foreground">Miércoles 7:00 PM</p>
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
