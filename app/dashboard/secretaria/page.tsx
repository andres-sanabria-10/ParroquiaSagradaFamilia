"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Church, DollarSign, ClipboardList, Calendar, Users, Bell } from "lucide-react"

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

export default function SecretariaDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Panel de Secretaria</h1>
            <p className="text-muted-foreground">Gestiona las solicitudes y documentos parroquiales</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partidas Procesadas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">38</div>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Misas Programadas</CardTitle>
                <Church className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">Próximos 7 días</p>
              </CardContent>
            </Card>
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

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Recientes</CardTitle>
                <CardDescription>Últimas solicitudes recibidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Solicitud de partida de bautismo</p>
                      <p className="text-xs text-muted-foreground">María González - Hace 1 hora</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Solicitud de misa especial</p>
                      <p className="text-xs text-muted-foreground">Familia Rodríguez - Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Partida de matrimonio procesada</p>
                      <p className="text-xs text-muted-foreground">Juan & Ana - Hace 3 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <p className="text-sm font-medium">Confirmar misa dominical</p>
                      <p className="text-xs text-muted-foreground">Vence hoy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <FileText className="w-4 h-4 text-secondary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Revisar solicitudes de partidas</p>
                      <p className="text-xs text-muted-foreground">3 pendientes</p>
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
