"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, FileText, Church, DollarSign } from "lucide-react"

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

export default function RegistroAdministrador() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rol: "",
    password: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registrando administrador:", formData)
    // Aquí iría la lógica de registro
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="párroco" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Registro de Administrador</h1>
            <p className="text-muted-foreground">Registra un nuevo administrador en el sistema</p>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Nuevo Administrador</CardTitle>
              <CardDescription>Complete los datos del nuevo administrador</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleChange("telefono", e.target.value)}
                      placeholder="Número de teléfono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select value={formData.rol} onValueChange={(value) => handleChange("rol", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secretaria">Secretaria</SelectItem>
                        <SelectItem value="tesorero">Tesorero</SelectItem>
                        <SelectItem value="catequista">Catequista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña Temporal</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Contraseña temporal"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Registrar Administrador
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
