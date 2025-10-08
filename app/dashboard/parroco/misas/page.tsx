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

const misasData = [
  {
    id: 1,
    fecha: "2024-01-21",
    hora: "10:00 AM",
    tipo: "Dominical",
    celebrante: "Padre José",
    asistentes: 150,
  },
  {
    id: 2,
    fecha: "2024-01-20",
    hora: "6:00 PM",
    tipo: "Diaria",
    celebrante: "Padre José",
    asistentes: 45,
  },
  {
    id: 3,
    fecha: "2024-01-19",
    hora: "7:00 AM",
    tipo: "Diaria",
    celebrante: "Padre José",
    asistentes: 30,
  },
]

export default function GestionMisas() {
  const [searchTerm, setSearchTerm] = useState("")
  const [misas] = useState(misasData)

  const filteredMisas = misas.filter((misa) => misa.tipo.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="párroco" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Misas</h1>
            <p className="text-muted-foreground">Administra el calendario de misas</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Calendario de Misas</CardTitle>
                  <CardDescription>Gestiona todas las celebraciones eucarísticas</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Misa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Celebrante</TableHead>
                    <TableHead>Asistentes</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMisas.map((misa) => (
                    <TableRow key={misa.id}>
                      <TableCell className="font-medium">{misa.fecha}</TableCell>
                      <TableCell>{misa.hora}</TableCell>
                      <TableCell>
                        <Badge variant={misa.tipo === "Dominical" ? "default" : "secondary"}>{misa.tipo}</Badge>
                      </TableCell>
                      <TableCell>{misa.celebrante}</TableCell>
                      <TableCell>{misa.asistentes}</TableCell>
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
