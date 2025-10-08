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

export default function SolicitudPartidaFeligres() {
  const [formData, setFormData] = useState({
    tipoPartida: "",
    nombreCompleto: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    nombrePadre: "",
    nombreMadre: "",
    fechaSacramento: "",
    motivoSolicitud: "",
    observaciones: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Solicitud de partida feligrés:", formData)
    // Aquí iría la lógica para enviar la solicitud
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="feligrés" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Solicitud de Partida</h1>
            <p className="text-muted-foreground">Solicita una copia de tu partida sacramental</p>
          </div>

          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Nueva Solicitud de Partida</CardTitle>
              <CardDescription>Complete todos los datos requeridos para procesar su solicitud</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoPartida">Tipo de Partida</Label>
                    <Select value={formData.tipoPartida} onValueChange={(value) => handleChange("tipoPartida", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bautismo">Bautismo</SelectItem>
                        <SelectItem value="confirmacion">Confirmación</SelectItem>
                        <SelectItem value="matrimonio">Matrimonio</SelectItem>
                        <SelectItem value="primera-comunion">Primera Comunión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                    <Input
                      id="nombreCompleto"
                      value={formData.nombreCompleto}
                      onChange={(e) => handleChange("nombreCompleto", e.target.value)}
                      placeholder="Su nombre completo"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
                    <Input
                      id="lugarNacimiento"
                      value={formData.lugarNacimiento}
                      onChange={(e) => handleChange("lugarNacimiento", e.target.value)}
                      placeholder="Ciudad, País"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombrePadre">Nombre del Padre</Label>
                    <Input
                      id="nombrePadre"
                      value={formData.nombrePadre}
                      onChange={(e) => handleChange("nombrePadre", e.target.value)}
                      placeholder="Nombre completo del padre"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombreMadre">Nombre de la Madre</Label>
                    <Input
                      id="nombreMadre"
                      value={formData.nombreMadre}
                      onChange={(e) => handleChange("nombreMadre", e.target.value)}
                      placeholder="Nombre completo de la madre"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaSacramento">Fecha Aproximada del Sacramento</Label>
                    <Input
                      id="fechaSacramento"
                      type="date"
                      value={formData.fechaSacramento}
                      onChange={(e) => handleChange("fechaSacramento", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motivoSolicitud">Motivo de la Solicitud</Label>
                    <Select
                      value={formData.motivoSolicitud}
                      onValueChange={(value) => handleChange("motivoSolicitud", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tramites-personales">Trámites Personales</SelectItem>
                        <SelectItem value="matrimonio">Para Matrimonio</SelectItem>
                        <SelectItem value="confirmacion">Para Confirmación</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleChange("observaciones", e.target.value)}
                    placeholder="Información adicional que pueda ayudar a localizar el registro..."
                    rows={3}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Información Importante:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• El tiempo de procesamiento es de 3-5 días hábiles</li>
                    <li>• Recibirá una notificación cuando su partida esté lista</li>
                    <li>• Debe presentar identificación al momento de recoger el documento</li>
                    <li>• El costo de la partida es de $10.000 pesos</li>
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
