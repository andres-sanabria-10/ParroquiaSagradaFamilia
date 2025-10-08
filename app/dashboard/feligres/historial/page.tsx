"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardList, Calendar, History, Search, Download, Eye } from "lucide-react"

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

const historialData = [
  {
    id: 1,
    tipo: "Partida",
    descripcion: "Partida de Bautismo - María González",
    fecha: "2024-01-15",
    estado: "Completada",
    categoria: "Bautismo",
  },
  {
    id: 2,
    tipo: "Misa",
    descripcion: "Misa de Difuntos - Por el alma de Juan Pérez",
    fecha: "2024-01-10",
    estado: "Programada",
    categoria: "Difuntos",
  },
  {
    id: 3,
    tipo: "Partida",
    descripcion: "Partida de Confirmación - Carlos Rodríguez",
    fecha: "2024-01-08",
    estado: "En Proceso",
    categoria: "Confirmación",
  },
  {
    id: 4,
    tipo: "Misa",
    descripcion: "Misa de Acción de Gracias",
    fecha: "2023-12-20",
    estado: "Completada",
    categoria: "Acción de Gracias",
  },
  {
    id: 5,
    tipo: "Partida",
    descripcion: "Partida de Matrimonio - Ana & Luis López",
    fecha: "2023-11-15",
    estado: "Completada",
    categoria: "Matrimonio",
  },
]

export default function HistorialFeligres() {
  const [searchTerm, setSearchTerm] = useState("")
  const [historial] = useState(historialData)

  const filteredHistorial = historial.filter((item) =>
    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Completada":
        return "default"
      case "Programada":
        return "secondary"
      case "En Proceso":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="feligrés" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Historial de Solicitudes</h1>
            <p className="text-muted-foreground">Revisa todas tus solicitudes y su estado actual</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{historial.length}</div>
                <p className="text-xs text-muted-foreground">Todas las solicitudes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                <ClipboardList className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {historial.filter((item) => item.estado === "Completada").length}
                </div>
                <p className="text-xs text-muted-foreground">Solicitudes finalizadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
                <Calendar className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {historial.filter((item) => item.estado === "En Proceso" || item.estado === "Programada").length}
                </div>
                <p className="text-xs text-muted-foreground">Solicitudes activas</p>
              </CardContent>
            </Card>
          </div>

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Historial Completo</CardTitle>
              <CardDescription>Todas sus solicitudes de partidas y misas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en historial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistorial.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">{item.tipo}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.descripcion}</TableCell>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.estado)}>{item.estado}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {item.estado === "Completada" && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
