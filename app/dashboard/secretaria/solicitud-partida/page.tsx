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
    title: "Solicitud de Partida",
    href: "/dashboard/secretaria/solicitud-partida",
    icon: ClipboardList,
  },
  {
    title: "Gestión de Partidas",
    href: "/dashboard/secretaria/partidas",
    icon: FileText,
  },
  {
    title: "Gestión de Misas",
    href: "/dashboard/secretaria/misas",
    icon: Church,
  },
  {
    title: "Contabilidad",
    href: "/dashboard/secretaria/contabilidad",
    icon: DollarSign,
  },
  {
    title: "Solicitud de Misa",
    href: "/dashboard/secretaria/solicitud-misa",
    icon: Calendar,
  },
]

export default function SolicitudPartida() {
  const [formData, setFormData] = useState({
    tipoPartida: "",
    nombreCompleto: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    nombrePadre: "",
    nombreMadre: "",
    fechaSacramento: "",
    observaciones: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Solicitud de partida:", formData)
    // Aquí iría la lógica para procesar la solicitud
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Solicitud de Partida</h1>
            <p className="text-muted-foreground">Procesa una nueva solicitud de partida sacramental</p>
          </div>

          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Nueva Solicitud de Partida</CardTitle>
              <CardDescription>Complete todos los datos requeridos para la partida</CardDescription>
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
                        <SelectItem value="defuncion">Defunción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                    <Input
                      id="nombreCompleto"
                      value={formData.nombreCompleto}
                      onChange={(e) => handleChange("nombreCompleto", e.target.value)}
                      placeholder="Nombre completo de la persona"
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

                <div className="space-y-2">
                  <Label htmlFor="fechaSacramento">Fecha del Sacramento</Label>
                  <Input
                    id="fechaSacramento"
                    type="date"
                    value={formData.fechaSacramento}
                    onChange={(e) => handleChange("fechaSacramento", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleChange("observaciones", e.target.value)}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Procesar Solicitud
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
