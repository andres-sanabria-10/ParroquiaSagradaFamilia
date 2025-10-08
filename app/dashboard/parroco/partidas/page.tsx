"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, FileText, Church, DollarSign, Plus, Search, Edit, Trash2 } from "lucide-react"

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
    title: "Contabilidad",
    href: "/dashboard/parroco/contabilidad",
    icon: DollarSign,
  },
]

const partidasData = [
  {
    id: 1,
    tipo: "Bautismo",
    nombre: "María González",
    fecha: "2024-01-15",
    estado: "Emitida",
  },
  {
    id: 2,
    tipo: "Matrimonio",
    nombre: "Juan Pérez & Ana López",
    fecha: "2024-01-10",
    estado: "Pendiente",
  },
  {
    id: 3,
    tipo: "Confirmación",
    nombre: "Carlos Rodríguez",
    fecha: "2024-01-08",
    estado: "Emitida",
  },
]

export default function GestionPartidas() {
  const [searchTerm, setSearchTerm] = useState("")
  const [partidas] = useState(partidasData)

  const filteredPartidas = partidas.filter((partida) => partida.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="párroco" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Partidas</h1>
            <p className="text-muted-foreground">Administra las partidas sacramentales</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lista de Partidas</CardTitle>
                  <CardDescription>Gestiona todas las partidas sacramentales</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Partida
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartidas.map((partida) => (
                    <TableRow key={partida.id}>
                      <TableCell className="font-medium">{partida.tipo}</TableCell>
                      <TableCell>{partida.nombre}</TableCell>
                      <TableCell>{partida.fecha}</TableCell>
                      <TableCell>
                        <Badge variant={partida.estado === "Emitida" ? "default" : "secondary"}>{partida.estado}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
