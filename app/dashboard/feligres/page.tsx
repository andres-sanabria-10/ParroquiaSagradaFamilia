"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ClipboardList, Calendar, History, Church, User, Mail, CreditCard, FileText, Shield, Loader2, Heart, DollarSign } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const sidebarItems = [
  {
    title: "Inicio",
    href: "/dashboard/feligres",
    icon: Church,
  },
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

interface UserData {
  name: string
  lastName: string
  documentNumber: string
  typeDocument: {
    document_type_name: string
  }
  mail: string
  role: string
  birthdate?: string
}

export default function FeligresDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showTitheModal, setShowTitheModal] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 👇 CAMBIO: Usar la API Route local
        const response = await fetch("/api/user/data", {
          method: 'GET',
          credentials: 'include',
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/login'
            return
          }
          throw new Error("Error al cargar datos del usuario")
        }
        
        const data = await response.json()
        console.log('✅ Datos del usuario cargados:', data)
        setUserData(data)
      } catch (error) {
        console.error("❌ Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatRole = (role: string) => {
    const roles: { [key: string]: string } = {
      usuario: "Feligrés",
      admin: "Administrador",
      super: "Párroco"
    }
    return roles[role] || role
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar items={sidebarItems} userRole="feligrés" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando información...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        <Sidebar items={sidebarItems} userRole="feligrés" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Panel del Feligrés</h1>
              <p className="text-muted-foreground">Bienvenido a tu espacio personal en la parroquia</p>
            </div>

            {/* Información del Usuario */}
            {userData && (
              <Card className="mb-8 border-2">
                <CardHeader>
                  <CardTitle>Mi Perfil</CardTitle>
                  <CardDescription>Información personal del feligrés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {getInitials(userData.name, userData.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <p className="font-semibold text-lg">{userData.name} {userData.lastName}</p>
                        <p className="text-sm text-muted-foreground">{formatRole(userData.role)}</p>
                      </div>
                    </div>

                    {/* Información Detallada */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <User className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Nombre Completo</p>
                          <p className="font-medium">{userData.name} {userData.lastName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Mail className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                          <p className="font-medium break-all">{userData.mail}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tipo de Documento</p>
                          <p className="font-medium">{userData.typeDocument.document_type_name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Número de Documento</p>
                          <p className="font-medium">{userData.documentNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 md:col-span-2">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Rol en la Parroquia</p>
                          <p className="font-medium">{formatRole(userData.role)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de Donaciones y Diezmos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl flex items-center justify-center">
                      <Heart className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">Donaciones</CardTitle>
                      <CardDescription>Apoya la obra de la parroquia</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowDonationModal(true)} 
                    className="w-full"
                    size="lg"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Realizar Donación
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">Diezmos</CardTitle>
                      <CardDescription>Contribuye con tu diezmo mensual</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowTitheModal(true)} 
                    className="w-full"
                    size="lg"
                    variant="secondary"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Aportar Diezmo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Donaciones */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              Realizar Donación
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Tu generosidad ayuda a mantener nuestra parroquia
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-4">
              Escanea el código QR o comunícate a nuestro WhatsApp para realizar tu donación de manera segura.
            </p>
            <img 
              src="/qr.png" 
              alt="Código QR para donaciones" 
              className="w-40 h-40 mx-auto rounded-md border-2 border-primary/20 p-2"
            />
            <p className="text-sm text-muted-foreground mt-4">
              ¡Gracias por tu apoyo y generosidad!
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDonationModal(false)} className="w-full">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Diezmos */}
      <Dialog open={showTitheModal} onOpenChange={setShowTitheModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              Aportar Diezmo
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Tu diezmo sostiene la misión evangelizadora
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-4">
              Escanea el código QR o comunícate a nuestro WhatsApp para realizar tu aporte de diezmo.
            </p>
            <img 
              src="/qr.png" 
              alt="Código QR para diezmos" 
              className="w-40 h-40 mx-auto rounded-md border-2 border-green-600/20 p-2"
            />
            <p className="text-sm text-muted-foreground mt-4">
              ¡Dios multiplique tu ofrenda!
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTitheModal(false)} className="w-full" variant="secondary">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}