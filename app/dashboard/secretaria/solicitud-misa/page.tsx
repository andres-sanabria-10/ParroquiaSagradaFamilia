"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Church, DollarSign, ClipboardList, Calendar } from "lucide-react"

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

export default function SolicitudMisa() {
  const [formData, setFormData] = useState({
    tipoMisa: "",
    fecha: "",
    hora: "",
    solicitante: "",
    telefono: "",
    motivo: "",
    observaciones: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Solicitud de misa:", formData)
    // Aquí iría la lógica para procesar la solicitud
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Solicitud de Misa</h1>
            <p className="text-muted-foreground">Programa una nueva celebración eucarística</p>
          </div>

          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Nueva Solicitud de Misa</CardTitle>
              <CardDescription>Complete los datos para programar la celebración</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoMisa">Tipo de Misa</Label>
                    <Select value={formData.tipoMisa} onValueChange={(value) => handleChange("tipoMisa", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="especial">Misa Especial</SelectItem>
                        <SelectItem value="difuntos">Misa de Difuntos</SelectItem>
                        <SelectItem value="accion-gracias">Acción de Gracias</SelectItem>
                        <SelectItem value="intencion">Misa por Intención</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solicitante">Nombre del Solicitante</Label>
                    <Input
                      id="solicitante"
                      value={formData.solicitante}
                      onChange={(e) => handleChange("solicitante", e.target.value)}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha Solicitada</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleChange("fecha", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora Solicitada</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={formData.hora}
                      onChange={(e) => handleChange("hora", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono de Contacto</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleChange("telefono", e.target.value)}
                      placeholder="Número de teléfono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de la Misa</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => handleChange("motivo", e.target.value)}
                    placeholder="Ej: Por el alma de..., En acción de gracias por..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleChange("observaciones", e.target.value)}
                    placeholder="Observaciones adicionales o peticiones especiales..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Programar Misa
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 bg-transparent">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
