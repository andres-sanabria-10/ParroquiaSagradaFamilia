"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Calendar, History, Church, FileText, Bell } from "lucide-react"

const sidebarItems = [
  {
    title: "Solicitud de Partida",
    href: "/dashboard/feligres/solicitud-partida",
    icon: ClipboardList,
  },
  {
    title: "Solicitud de Misas",
    href: "/dashboard/feligres/solicitud-misas",
    icon: Calendar,
  },
  {
    title: "Historial",
    href: "/dashboard/feligres/historial",
    icon: History,
  },
]

export default function FeligresDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="feligrés" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Panel del Feligrés</h1>
            <p className="text-muted-foreground">Bienvenido a tu espacio personal en la parroquia</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitudes Activas</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">En proceso</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partidas Obtenidas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">Total histórico</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Misas Solicitadas</CardTitle>
                <Church className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Este año</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Solicitar Partida</CardTitle>
                    <CardDescription>Solicita una partida sacramental</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle>Solicitar Misa</CardTitle>
                    <CardDescription>Programa una misa especial</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Tus últimas interacciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Partida de bautismo aprobada</p>
                      <p className="text-xs text-muted-foreground">Hace 2 días</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Misa especial programada</p>
                      <p className="text-xs text-muted-foreground">Hace 1 semana</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Solicitud de confirmación en proceso</p>
                      <p className="text-xs text-muted-foreground">Hace 2 semanas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Actividades de tu interés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Church className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Misa Dominical</p>
                      <p className="text-xs text-muted-foreground">Domingo 10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tu misa especial</p>
                      <p className="text-xs text-muted-foreground">Sábado 6:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <FileText className="w-4 h-4 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Entrega de partida</p>
                      <p className="text-xs text-muted-foreground">Lunes 9:00 AM</p>
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
