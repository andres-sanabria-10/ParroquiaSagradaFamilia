"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Church, DollarSign, ClipboardList, Calendar, TrendingUp } from "lucide-react"

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

const transacciones = [
  {
    id: 1,
    fecha: "2024-01-20",
    concepto: "Diezmos y Ofrendas",
    tipo: "Ingreso",
    monto: 450.0,
  },
  {
    id: 2,
    fecha: "2024-01-19",
    concepto: "Partidas Sacramentales",
    tipo: "Ingreso",
    monto: 200.0,
  },
  {
    id: 3,
    fecha: "2024-01-18",
    concepto: "Donaciones",
    tipo: "Ingreso",
    monto: 800.0,
  },
  {
    id: 4,
    fecha: "2024-01-17",
    concepto: "Servicios Especiales",
    tipo: "Ingreso",
    monto: 150.0,
  },
]

export default function ContabilidadSecretaria() {
  const totalIngresos = transacciones.reduce((sum, t) => sum + t.monto, 0)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Contabilidad</h1>
            <p className="text-muted-foreground">Consulta el histórico de transacciones</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalIngresos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transacciones.length}</div>
                <p className="text-xs text-muted-foreground">Registradas</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Ingresos</CardTitle>
              <CardDescription>Registro de ingresos parroquiales</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacciones.map((transaccion) => (
                    <TableRow key={transaccion.id}>
                      <TableCell className="font-medium">{transaccion.fecha}</TableCell>
                      <TableCell>{transaccion.concepto}</TableCell>
                      <TableCell>
                        <Badge variant="default">{transaccion.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${transaccion.monto.toFixed(2)}
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
