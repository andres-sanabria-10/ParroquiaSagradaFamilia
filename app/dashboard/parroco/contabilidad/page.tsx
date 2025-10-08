"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, FileText, Church, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

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
    concepto: "Servicios Públicos",
    tipo: "Egreso",
    monto: -120.0,
  },
  {
    id: 3,
    fecha: "2024-01-18",
    concepto: "Partidas Sacramentales",
    tipo: "Ingreso",
    monto: 200.0,
  },
  {
    id: 4,
    fecha: "2024-01-17",
    concepto: "Mantenimiento Iglesia",
    tipo: "Egreso",
    monto: -300.0,
  },
  {
    id: 5,
    fecha: "2024-01-16",
    concepto: "Donaciones",
    tipo: "Ingreso",
    monto: 800.0,
  },
]

export default function Contabilidad() {
  const totalIngresos = transacciones.filter((t) => t.tipo === "Ingreso").reduce((sum, t) => sum + t.monto, 0)
  const totalEgresos = Math.abs(transacciones.filter((t) => t.tipo === "Egreso").reduce((sum, t) => sum + t.monto, 0))
  const balance = totalIngresos - totalEgresos

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="párroco" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Contabilidad</h1>
            <p className="text-muted-foreground">Histórico de ingresos y egresos parroquiales</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalEgresos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${balance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Diferencia</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transacciones</CardTitle>
              <CardDescription>Registro detallado de ingresos y egresos</CardDescription>
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
                        <Badge variant={transaccion.tipo === "Ingreso" ? "default" : "destructive"}>
                          {transaccion.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaccion.monto > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${Math.abs(transaccion.monto).toFixed(2)}
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
