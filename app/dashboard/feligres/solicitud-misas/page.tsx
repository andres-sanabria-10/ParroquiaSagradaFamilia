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
import { ClipboardList, Calendar, History } from "lucide-react"

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

export default function SolicitudMisasFeligres() {
  const [formData, setFormData] = useState({
    tipoMisa: "",
    fechaPreferida: "",
    horaPreferida: "",
    nombreSolicitante: "",
    telefono: "",
    email: "",
    motivo: "",
    nombreDifunto: "",
    observaciones: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Solicitud de misa feligrés:", formData)
    // Aquí iría la lógica para enviar la solicitud
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="feligrés" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Solicitud de Misas</h1>
            <p className="text-muted-foreground">Solicita una misa especial para tus intenciones</p>
          </div>

          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Nueva Solicitud de Misa</CardTitle>
              <CardDescription>Complete los datos para programar su misa especial</CardDescription>
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
                        <SelectItem value="difuntos">Misa de Difuntos</SelectItem>
                        <SelectItem value="accion-gracias">Acción de Gracias</SelectItem>
                        <SelectItem value="intencion-especial">Intención Especial</SelectItem>
                        <SelectItem value="aniversario">Aniversario</SelectItem>
                        <SelectItem value="salud">Por la Salud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombreSolicitante">Su Nombre Completo</Label>
                    <Input
                      id="nombreSolicitante"
                      value={formData.nombreSolicitante}
                      onChange={(e) => handleChange("nombreSolicitante", e.target.value)}
                      placeholder="Su nombre completo"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaPreferida">Fecha Preferida</Label>
                    <Input
                      id="fechaPreferida"
                      type="date"
                      value={formData.fechaPreferida}
                      onChange={(e) => handleChange("fechaPreferida", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horaPreferida">Hora Preferida</Label>
                    <Select
                      value={formData.horaPreferida}
                      onValueChange={(value) => handleChange("horaPreferida", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar hora" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7:00">7:00 AM</SelectItem>
                        <SelectItem value="8:00">8:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleChange("telefono", e.target.value)}
                      placeholder="Su número de teléfono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="su@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de la Misa</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => handleChange("motivo", e.target.value)}
                    placeholder="Ej: Por el alma de..., En acción de gracias por..., Por la salud de..."
                    required
                  />
                </div>

                {formData.tipoMisa === "difuntos" && (
                  <div className="space-y-2">
                    <Label htmlFor="nombreDifunto">Nombre del Difunto</Label>
                    <Input
                      id="nombreDifunto"
                      value={formData.nombreDifunto}
                      onChange={(e) => handleChange("nombreDifunto", e.target.value)}
                      placeholder="Nombre completo del difunto"
                      required
                    />
                  </div>
                )}

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

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Información sobre Misas:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Las misas especiales tienen un costo de $25.000 pesos</li>
                    <li>• Se confirmará la fecha y hora según disponibilidad</li>
                    <li>• Recibirá confirmación por teléfono o correo electrónico</li>
                    <li>• Puede solicitar hasta 3 fechas alternativas</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Enviar Solicitud
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
